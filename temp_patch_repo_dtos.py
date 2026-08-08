import pathlib,re
root=pathlib.Path('src/main/java')
for p in sorted(root.rglob('*.java')):
    text=p.read_text(encoding='utf-8')
    orig=text
    # repository generic id type changes
    text=re.sub(r'MongoRepository<([^,>]+),\s*Long>', r'MongoRepository<\1, String>', text)
    # field id type conversions for IDs in entities/DTOs
    text=re.sub(r'private\s+Long\s+([A-Za-z0-9_]*Id)\s*;', r'private String \1;', text)
    text=re.sub(r'private\s+Long\s+id\s*;', r'private String id;', text)
    # method parameter type conversions for id-like params
    text=re.sub(r'\bLong\s+([A-Za-z0-9_]*Id)\b', r'String \1', text)
    text=re.sub(r'\bLong\s+id\b', r'String id', text)
    # query method params in repos
    text=re.sub(r'findByIdAnd([^\(]*)\(String id', r'findByIdAnd\1(String id', text)
    # fallback remove manual generation calls
    text=text.replace('.id(nextId())', '')
    text=text.replace('.id(idGenerator.getAndIncrement())', '')
    if text != orig:
        p.write_text(text, encoding='utf-8')
        print('patched', p.relative_to(root))
