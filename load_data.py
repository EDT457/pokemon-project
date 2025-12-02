import csv
import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port='5432',
    user='postgres',
    password='5569',
    database='pokemon_db'
)

cursor = conn.cursor()

cursor.execute('DROP TABLE IF EXISTS pokemon')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS pokemon (
        pokedex_number INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        hp INTEGER,
        attack INTEGER,
        defense INTEGER,
        sp_attack INTEGER,
        sp_defense INTEGER,
        speed INTEGER,
        type1 TEXT,
        type2 TEXT,
        abilities TEXT
    )
''')

with open('data/pokemon.csv', 'r', encoding='utf-8') as file:
    csv_reader = csv.DictReader(file)

    for row in csv_reader:
        if int(row['generation']) == 1:
            pokedex_number = row['pokedex_number']
            name = row['name']
            hp = row['hp']
            attack = row['attack']
            defense = row['defense']
            sp_attack = row['sp_attack']
            sp_defense = row['sp_defense']
            speed = row['speed']
            type1 = row['type1']
            type2 = row['type2']
            abilities = row['abilities']

            cursor.execute('''
                INSERT INTO pokemon VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (pokedex_number, name, hp, attack, defense, sp_attack, sp_defense, speed, type1, type2, abilities))

conn.commit()

# Verification (no second connection, just reuse the same one)
cursor.execute('SELECT COUNT(*) FROM pokemon')
count = cursor.fetchone()[0]
print(f"Total Pokémon loaded: {count}")

cursor.execute('SELECT name FROM pokemon LIMIT 5')
rows = cursor.fetchall()
print("First 5 Pokémon:")
for row in rows:
    print(f"  - {row[0]}")

cursor.close()
conn.close()