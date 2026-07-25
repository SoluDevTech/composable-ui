import { describe, it, expect } from "vitest";
import { parseFrontmatter, buildFrontmatter } from "@/application/lib/frontmatter";

describe("parseFrontmatter", () => {
  it("extracts name and description from YAML frontmatter", () => {
    // Arrange
    const input = "---\nname: rag\ndescription: RAG queries\n---\n# Body";

    // Act
    const result = parseFrontmatter(input);

    // Assert
    expect(result.data).toEqual({ name: "rag", description: "RAG queries" });
    expect(result.body).toBe("# Body");
  });

  it("returns empty data and full body when no frontmatter", () => {
    // Arrange
    const input = "no frontmatter";

    // Act
    const result = parseFrontmatter(input);

    // Assert
    expect(result.data).toEqual({});
    expect(result.body).toBe("no frontmatter");
  });

  it("handles multi-line frontmatter", () => {
    // Arrange — frontmatter with several keys
    const input =
      "---\nname: research\ndescription: Research agent\nauthor: team\n---\n# Research skill";

    // Act
    const result = parseFrontmatter(input);

    // Assert
    expect(result.data).toEqual({
      name: "research",
      description: "Research agent",
      author: "team",
    });
    expect(result.body).toBe("# Research skill");
  });

  it("handles special characters in description", () => {
    // Arrange — description with punctuation and accents
    const input = '---\nname: rag\ndescription: RAG: "queries & accents" — éàç\n---\n# Body';

    // Act
    const result = parseFrontmatter(input);

    // Assert
    expect(result.data).toHaveProperty("name", "rag");
    expect(result.data).toHaveProperty("description", 'RAG: "queries & accents" — éàç');
    expect(result.body).toBe("# Body");
  });

  it("does NOT truncate body containing a horizontal rule", () => {
    // Arrange — body contains a `---` line (markdown horizontal rule) after
    // the frontmatter. The closing delimiter regex with the `m` flag would
    // incorrectly match this line and truncate the body.
    const input =
      "---\nname: rag\ndescription: RAG queries\n---\n# Title\n---\nsome content after hr";

    // Act
    const result = parseFrontmatter(input);

    // Assert — the body must include everything after the frontmatter,
    // including the horizontal rule line and the content after it.
    expect(result.data).toEqual({ name: "rag", description: "RAG queries" });
    expect(result.body).toBe("# Title\n---\nsome content after hr");
  });
});

describe("buildFrontmatter", () => {
  it("builds valid YAML frontmatter with name and description", () => {
    // Arrange
    const data = { name: "rag", description: "RAG" };

    // Act
    const output = buildFrontmatter(data, "");

    // Assert
    expect(output).toBe("---\nname: rag\ndescription: RAG\n---\n");
  });

  it("appends body after frontmatter", () => {
    // Arrange
    const data = { name: "rag", description: "RAG" };
    const body = "# Body";

    // Act
    const output = buildFrontmatter(data, body);

    // Assert
    expect(output).toBe("---\nname: rag\ndescription: RAG\n---\n# Body");
  });
});
