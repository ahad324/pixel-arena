import os

EXTENSION = ".txt"
EXCLUDED_DIRS = {"node_modules"}
EXCLUDED_FILES = {"package-lock.json"}
EXCLUDED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".ico"}


def should_exclude(file):
    _, ext = os.path.splitext(file)
    return file in EXCLUDED_FILES or ext.lower() in EXCLUDED_EXTENSIONS


def generate_structure(path, depth=0):
    structure = ""
    try:
        for item in sorted(os.listdir(path)):
            if item in EXCLUDED_DIRS:
                continue
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                structure += "│   " * depth + "├── " + item + "/\n"
                structure += generate_structure(item_path, depth + 1)
            elif not should_exclude(item):
                structure += "│   " * depth + "├── " + item + "\n"
    except PermissionError:
        structure += "│   " * depth + "├── [Permission Denied]\n"
    return structure


def show_file_contents(path, output_file):
    if should_exclude(os.path.basename(path)):
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().strip()
        if not content:
            return
        foldername, filename = os.path.split(path)
        foldername = foldername.replace(os.path.sep, "/")
        output_file.write(f"{foldername}/{filename}\n")
        output_file.write("<DOCUMENT>\n")
        output_file.write(content + "\n")
        output_file.write("</DOCUMENT>\n\n")
    except Exception as e:
        print(f"Error reading file {path}: {e}")


def process_project(section):
    folder = "client" if section == "frontend" else "server"
    label = "Frontend" if section == "frontend" else "Backend"
    base_path = os.path.join(os.getcwd(), folder)

    if not os.path.isdir(base_path):
        print(f"{label} folder not found at: {base_path}")
        return

    # Structure
    structure = generate_structure(base_path)
    structure_filename = f"{label}_Structure{EXTENSION}"
    with open(structure_filename, "w", encoding="utf-8") as f:
        f.write("Directory Structure:\n\n")
        f.write(structure)
    print(f"{label} structure saved to {structure_filename}")

    # Codebase
    content_filename = f"{label}_Codebase{EXTENSION}"
    with open(content_filename, "w", encoding="utf-8") as output_file:
        for root, dirs, files in os.walk(base_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for file in files:
                if should_exclude(file):
                    continue
                file_path = os.path.join(root, file)
                show_file_contents(file_path, output_file)
    print(f"{label} codebase saved to {content_filename}")


if __name__ == "__main__":
    choice = input("Enter [f] for frontend or [b] for backend: ").strip().lower()
    if choice == "f":
        process_project("frontend")
    elif choice == "b":
        process_project("backend")
    else:
        print("Invalid input. Use 'f' or 'b'.")