# 1️⃣ CREATE – Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation
    F->>B: POST /api/resources (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>S: createResource(data)
        S->>DB: INSERT INTO resources
        DB-->>S: Result / Duplicate error

        alt Duplicate
            S-->>B: Duplicate detected
            B-->>F: 409 Conflict
            F-->>U: Show duplicate message
        else Success
            S-->>B: Created resource
            B-->>F: 201 Created
            F-->>U: Show success message
        end
    end
```

# 2️⃣ READ — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Page load / navigate to resources view
    F->>B: GET /api/resources

    B->>S: getAllResources()
    S->>DB: SELECT * FROM resources

    alt No resources found
        DB-->>S: Empty result set
        S-->>B: []
        B-->>F: 200 OK + [] (empty array)
        F-->>U: Show empty list / no resources message
    else Resources found
        DB-->>S: Rows
        S-->>B: Array of resources
        B-->>F: 200 OK + resources[]
        F-->>U: Render resources list in UI
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit edit form
    F->>F: Client-side validation
    F->>B: PUT /api/resources/:id (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>S: updateResource(id, data)
        S->>DB: UPDATE resources WHERE id = :id

        alt Resource not found
            DB-->>S: 0 rows affected
            S-->>B: Not found
            B-->>F: 404 Not Found
            F-->>U: Show not found message
        else Duplicate / Conflict
            DB-->>S: Unique constraint error
            S-->>B: Duplicate detected
            B-->>F: 409 Conflict
            F-->>U: Show duplicate message
        else Success
            DB-->>S: Updated resource
            S-->>B: Updated resource object
            B-->>F: 200 OK + updated resource
            F-->>U: Show success message, refresh list
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Click delete button (confirm dialog)
    F->>B: DELETE /api/resources/:id

    B->>S: deleteResource(id)
    S->>DB: DELETE FROM resources WHERE id = :id

    alt Resource not found
        DB-->>S: 0 rows affected
        S-->>B: Not found
        B-->>F: 404 Not Found
        F-->>U: Show not found / already deleted message
    else Resource has dependencies
        DB-->>S: Foreign key constraint error
        S-->>B: Constraint violation
        B-->>F: 409 Conflict
        F-->>U: Show conflict message (resource in use)
    else Success
        DB-->>S: 1 row deleted
        S-->>B: Deletion confirmed
        B-->>F: 204 No Content
        F-->>U: Remove resource from list, show success message
    end
```
