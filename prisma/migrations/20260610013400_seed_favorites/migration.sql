-- Seed favorite collections and items

UPDATE "Collection"
SET "isFavorite" = true
WHERE "name" = 'React Patterns'
  AND "userId" = (SELECT "id" FROM "User" WHERE "email" = 'john@example.com');

UPDATE "Collection" 
SET "isFavorite" = true
WHERE "name" = 'Terminal Commands'
  AND "userId" = (SELECT "id" FROM "User" WHERE "email" = 'john@example.com');

UPDATE "Item"
SET "isFavorite" = true
WHERE "title" = 'Custom Hooks'
  AND "userId" = (SELECT "id" FROM "User" WHERE "email" = 'john@example.com');

UPDATE "Item"
SET "isFavorite" = true
WHERE "title" = 'Git Operations'
  AND "userId" = (SELECT "id" FROM "User" WHERE "email" = 'john@example.com');
