# 🧭 Random JSON Generator — User Manual

This document explains how to use the Random JSON Generator feature in your app. It covers how to create, edit, save, and generate random JSON templates, as well as how to import results into the main JSON editor.

---

## 🎯 Overview

The Random JSON Generator allows users to design flexible JSON templates that can dynamically generate randomized data. It’s ideal for testing, mock data creation, and rapid prototyping.

You can:

- Edit and preview JSON templates in real time.
- Generate randomized JSON based on the defined template.
- Save and reuse templates locally.
- Import generated JSON directly into the main JSON editor.

---

## 🧩 Interface Overview

The screen is divided into two main panels:

| Panel              | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **Template Panel** | Where you edit the JSON template structure. Supports nested objects, arrays, and numeric ranges. |
| **Output Panel**   | Displays the generated random JSON results based on your template.                               |

At the top, a toolbar provides quick access to actions like generating, saving, or importing data.

---

## ⚙️ Toolbar Actions

| Action            | Description                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| 📁 Open Saved     | Opens the saved templates dialog to select and load existing templates.                          |
| ➕ New Template   | Opens a dialog to create a new template from the current editor content.                         |
| 🔄 Apply Template | Parses and applies the current editor text as the working template. Useful after manual edits.   |
| 💾 Save           | Saves the current template. If none loaded, prompts for a name (Save As).                        |
| 🎲 Generate JSON  | Produces a random JSON object based on the current template. Output is shown in the right panel. |
| ⬆️ Import JSON    | Imports the generated JSON into the main JSON editor of the app.                                 |

---

## 🧱 Template Format

Each template defines the structure and randomization rules for generating JSON objects.

Example:

```json
{
  "character": "Hero",
  "level": { "min": 1, "max": 10, "integer": true },
  "hp": { "min": 50, "max": 200, "integer": true },
  "mana": { "min": 0, "max": 150, "integer": true },
  "inventory": ["sword", "shield", "potion", "bow"],
  "location": {
    "x": { "min": -100, "max": 100, "integer": true },
    "y": { "min": -100, "max": 100, "integer": true }
  }
}
```

### Supported Rules

| Field Type    | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| Static Value  | Directly included in output as-is (e.g., "Hero").                  |
| Range Object  | Defines numeric ranges using `min`, `max`, and optional `integer`. |
| Array         | One random value from the array is selected.                       |
| Nested Object | Recursively generates random values for each key.                  |

### Advanced Rules (Text and Structure)

You can use special rule objects to generate text and dynamic structures. These rules are recognized when the object contains certain required keys; some extra metadata keys are allowed alongside.

1. Lorem ipsum text

- Shapes:
  - `{ "lorem": 5 }` → 5 words
  - `{ "lorem": { "words": 5 } }`
  - `{ "lorem": { "sentences": 2 } }`
  - `{ "lorem": { "paragraphs": 3 } }`
- Optional metadata allowed next to `lorem`: `capitalize: true`, `prefix: "["`, `suffix: "]"`, `separator: ", "` (when applicable)
- Examples:

```json
{
  "title": { "lorem": 7, "capitalize": true },
  "subtitle": { "lorem": { "sentences": 1 }, "prefix": "(", "suffix": ")" },
  "body": { "lorem": { "paragraphs": 2 } }
}
```

1. Random object (dynamic keys)

- Shape: `{ "randomObject": { "keys": number|{min,max,integer}, "keyLength?": number|{min,max,integer}, "keyCharset?": string, "value": template }, "keyPrefix?": string }`
- Generates an object with N random keys and values derived from the `value` template
- Defaults: `keyLength` 5–10, `keyCharset` a–z
- Example:

```json
{
  "attributes": {
    "randomObject": {
      "keys": { "min": 2, "max": 4 },
      "keyLength": { "min": 4, "max": 8 },
      "value": { "min": 1, "max": 100, "integer": true }
    },
    "keyPrefix": "k_"
  }
}
```

1. Repeat (arrays with count)

- Shape: `{ "repeat": number|{min,max,integer}, "of": template, "joinWith?": string }`
- Produces an array of generated items; if every item is a string and `joinWith` is provided, returns a single joined string
- Examples:

```json
{
  "tags": { "repeat": { "min": 3, "max": 6 }, "of": { "lorem": 1 } },
  "slug": { "repeat": 4, "of": { "lorem": 1 }, "joinWith": "-" }
}
```

---

## 💾 Saving Templates

When you save a template:

1. If a template is loaded (you see its name), Save updates that template.
2. If no template is loaded, Save will prompt for a name (Save As).

To create a new copy at any time, use New Template and give it a name (this acts like Save As).

Templates are stored in localStorage for future use.

---

## 📂 Loading Saved Templates

Click Open Saved to access all previously stored templates. The dialog shows:

- Template name
- Creation and last updated date

Select one to load it into the editor. A toast confirms loading.

---

## 🎲 Generating Random JSON

After editing your template:

1. Click Generate JSON.
2. The output panel displays the randomized result.
3. You can import it directly into the main editor.

If the template is invalid (e.g., broken JSON syntax), an error toast appears.

---

## 📤 Importing JSON into Editor

Once a random JSON is generated:

- Click Import JSON.
- The data is sent to the main JSON editor.
- You’ll see a success toast.

---

## ⚠️ Notifications

- ✅ Template saved/updated successfully
- ⚠️ Invalid JSON template
- 🎲 Random JSON imported
- ❌ Failed to update template

---

## 💡 Tips

- Validate your JSON before Apply/Save.
- Use descriptive template names.
- Clearing browser data clears saved templates.

---

## 🔒 Storage Details

- Templates are stored under a specific localStorage key.
- Each entry includes:
  - `id` (UUID)
  - `name`
  - `data` (template JSON)
  - `createdAt` (ISO string)
  - `lastModified` (ISO string)

---

## 🧠 Summary

The Random JSON Generator streamlines creating reusable, flexible mock data templates with quick dialogs, clear toasts, and local persistence. It’s a fast, reliable way to generate JSON for testing and prototyping.
