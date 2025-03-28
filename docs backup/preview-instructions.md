# Lokale Vorschau der Dokumentation

Um die Dokumentation lokal anzuzeigen und zu testen, folge diesen Schritten:

## Voraussetzungen

- Ruby installieren (falls noch nicht geschehen)
   - Windows: [RubyInstaller](https://rubyinstaller.org/)
   - macOS: `brew install ruby` (mit Homebrew)
   - Linux: `sudo apt install ruby-full` (Ubuntu/Debian)

## Lokalen Server starten

1. Öffne ein Terminal/Kommandozeile
2. Navigiere in das `docs`-Verzeichnis:
   ```
   cd /pfad/zu/data-cards/docs
   ```
3. Installiere die benötigten Gems beim ersten Mal:
   ```
   bundle install
   ```
4. Starte den Jekyll-Server:
   ```
   bundle exec jekyll serve
   ```
5. Öffne im Browser: http://localhost:4000

## Inhalte bearbeiten

- Alle Inhalte sind in Markdown (`.md`-Dateien) geschrieben
- Die Hauptseiten befinden sich im Hauptverzeichnis (`docs/`)
- Funktionen sind im `features/` Verzeichnis
- Beispiele sind im `examples/` Verzeichnis

## Markdown mit HTML kombinieren

Du kannst speziell formatierte Elemente mit Includes einfügen:

### Notiz einfügen

```markdown
{% include note.html content="Dies ist eine Notiz mit **Markdown** Unterstützung." %}
```

### Karte einfügen

```markdown
{% include card.html title="Kartenüberschrift" content="
- Liste mit Punkten
- Zweiter Punkt
- Dritter Punkt
" %}
```

### Code-Block mit Überschrift

```markdown
{% include code.html title="Beispiel" code="```datacards
TABLE title, author FROM #books
```" %}
```

## Seite erstellen

1. Erstelle eine neue Markdown-Datei (z.B. `neue-seite.md`)
2. Füge YAML-Frontmatter hinzu:
   ```
   ---
   layout: page
   title: Meine neue Seite
   ---
   ```
3. Schreibe den Inhalt in Markdown
4. Speichere die Datei und der Server aktualisiert die Seite automatisch

## Nach GitHub deployen

1. Pushe die Änderungen in dein GitHub-Repository
2. GitHub Pages wird automatisch die Seite bauen und deployen
3. Die Dokumentation ist dann unter `https://username.github.io/data-cards/` verfügbar
