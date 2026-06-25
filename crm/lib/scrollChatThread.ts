export function scrollChatContainerToBottom(
  container: HTMLElement | null,
  behavior: ScrollBehavior = "instant"
) {
  if (!container) return;

  const scroll = () => {
    if (behavior === "instant") {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  };

  scroll();
  requestAnimationFrame(() => {
    scroll();
    requestAnimationFrame(scroll);
  });
}
