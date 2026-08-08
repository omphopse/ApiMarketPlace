import pathlib, re
root = pathlib.Path('src/main/java/com/marketplace/entity')
for p in sorted(root.glob('*.java')):
    text = p.read_text(encoding='utf-8')
    orig = text
    if '@MongoId(FieldType.INT64)' in text:
        text = text.replace('@MongoId(FieldType.INT64)', '@Id')
    if 'import org.springframework.data.mongodb.core.mapping.FieldType;' in text:
        text = text.replace('import org.springframework.data.mongodb.core.mapping.FieldType;\n', '')
    if 'import org.springframework.data.mongodb.core.mapping.MongoId;' in text:
        text = text.replace('import org.springframework.data.mongodb.core.mapping.MongoId;\n', '')
    if '@Id' in text and 'import org.springframework.data.annotation.Id;' not in text:
        text = text.replace('import org.springframework.data.mongodb.core.mapping.Document;\n', 'import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\n')
    text = re.sub(r'private\s+Long\s+id\s*;', 'private String id;', text)
    if text != orig:
        p.write_text(text, encoding='utf-8')
        print('patched', p.name)
