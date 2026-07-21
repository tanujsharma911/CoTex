export function injectCursorStyleOnlyOneTime(
  userId: string,
  name: string,
  color: string,
) {
  const className = `remote-cursor-${userId}`;

  if (!document.getElementById(className)) {
    const style = document.createElement("style");

    style.id = className;

    style.innerHTML = `
      .${className} {
        border-left: 2px solid ${color} !important;
        margin-left: 0;
        position: relative;
        z-index: 10;
      }
      .${className}::after {
        content: '${name}';
        position: absolute;
        bottom: -21px;
        left: -2px;
        background: ${color};
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 3px;
        border-top-left-radius: 0;
        white-space: nowrap;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
  return className;
}
