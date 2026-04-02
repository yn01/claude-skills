from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-mcp-server")


# --- Tools ---

@mcp.tool()
def to_uppercase(text: str) -> str:
    """Converts input text to uppercase.

    Use when the user asks to uppercase, capitalize, or convert text to all caps.

    Args:
        text: The text to convert to uppercase.

    Returns:
        The input text converted to uppercase.
    """
    return text.upper()


# --- Entry point ---

def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
