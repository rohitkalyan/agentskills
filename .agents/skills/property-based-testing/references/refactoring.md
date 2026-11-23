# Refactoring to Expose a Property

"This code has no algebraic shape" is often a fact about how the code is *arranged*
rather than about what it does. A function that mixes a pure calculation with a database
write has a property; it just does not have a seam to assert it through. These are the
rearrangements that expose one, strongest first.

Name the property and keep refactoring within the authorized implementation scope. Prefer testing through an existing boundary; a testing task does not justify unrelated API or production rewrites.

## 1. Extract the pure core

The highest-value one by a wide margin, and the reason most "untestable" code is
testable. I/O at the edges, calculation in the middle, assert against the middle.

```python
# Before: the arithmetic is real but unreachable without a database
def process_order(order_id: str) -> None:
    order = db.fetch(order_id)
    total = apply_discount(order, calculate_discount(order))
    db.save(order_id, total)


# After: the pure core takes arguments and returns a value
def order_total(order: Order, rules: DiscountRules) -> Decimal:
    return apply_discount(order, calculate_discount(order, rules))


def process_order(order_id: str) -> None:
    order = db.fetch(order_id)
    db.save(order_id, order_total(order, get_discount_rules()))
```

`order_total` now supports invariants (never negative, never above the undiscounted
total), monotonicity in the discount rate, and an oracle against a reference
calculation. `process_order` keeps example tests with a mocked `db`, which is the right
tool for a two-line wrapper.

The same move applies to anything whose observable is a side effect: build the message,
the request, the query object — then send it. Construction is testable; delivery is
mocked.

## 2. Add the missing inverse

A one-way operation has no roundtrip by definition. Sometimes the inverse is worth
having in production anyway, and sometimes it is worth having *only* for the test — say
which.

```python
def encode_message(msg: dict) -> bytes: ...
def decode_message(data: bytes) -> dict: ...  # unlocks decode(encode(x)) == x
```

Unlocks roundtrip, the strongest property in the catalog. Worth asking for even when the
production code never decodes: a serializer nobody can read back is usually a latent
bug, not a design.

## 3. Structured representation plus a renderer

String building by concatenation has nothing to assert beyond "contains a substring".
Split the value from its rendering and the inverse becomes available.

```python
# Before
def build_query(table: str, filters: dict) -> str:
    q = f"SELECT * FROM {table}"
    ...


# After
@dataclass
class Query:
    table: str
    filters: dict


def render(q: Query) -> str: ...
def parse(sql: str) -> Query: ...  # now render/parse is a roundtrip
```

This is pattern 2 wearing different clothes, and it is where escaping bugs live: a
roundtrip over generated filter values finds quoting errors that no hand-written example
will.

## 4. Return a value instead of mutating

For in-place mutation, preserve an independent input copy before calling the function. A pure returned-value variant may help when it fits the production API, but is not required for testing.

```python
def sort_tasks(tasks: list[Task]) -> None: ...  # preserve an input copy for comparison
def sorted_tasks(tasks: list[Task]) -> list[Task]:  # unlocks is_sorted, permutation,
    ...  # idempotence, length preservation
```

If the mutating signature has to stay, a wrapper that copies and returns is enough for
the test to have something to hold.

## 5. Inject the dependency

Globals and environment values can be controlled with fixtures or monkeypatching. Dependency injection can make the input domain clearer and avoid hidden test coupling.

```python
def validate(data: str) -> bool:
    return len(data) <= CONFIG.max_length


def validate(data: str, max_len: int):
    return len(data) <= max_len
```

Parameterising the bound is what lets a generator drive `max_len` to 0, to 1, and to the
maximum representable value — the boundaries where validators actually break.

## When not to suggest this

- **The property you would unlock is "no crash".** Restructuring production code to
  enable the weakest property in the catalog is a bad trade. Say the code is a poor PBT
  candidate and stop.
- **The module needs wholesale restructuring.** Say that once, plainly. Twenty
  individually-reasonable suggestions on one file is noise, and it reads as a rewrite
  request rather than a testing recommendation.
- **The refactor breaks a public API.** Flag it as breaking and offer the
  backwards-compatible version, even when the clean version is obviously nicer.
- **Existing tests cover the code.** Run them after any refactor and say you did.
  "Enabled a property test and broke two example tests" is not progress.
