document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("robot-search");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".robot-card"));
  const resultCount = document.getElementById("result-count");
  const noResults = document.getElementById("no-results");

  if (!searchInput || !filterButtons.length || !cards.length || !resultCount || !noResults) {
    return;
  }

  let activeFilter = "all";

  const normalize = (value) => value.toLowerCase().trim();

  const splitCamelCase = (value) => value.replace(/([a-z])([A-Z])/g, "$1 $2");

  const getBadgeText = (card) =>
    Array.from(card.querySelectorAll(".wiki-badge"))
      .map((badge) =>
        [
          badge.getAttribute("title") || "",
          badge.getAttribute("alt") || "",
          splitCamelCase(
            (badge.getAttribute("src") || "")
              .split("/")
              .pop()
              ?.replace(/\.[^.]+$/, "")
              .replace(/Badge$/, "") || ""
          ),
        ].join(" ")
      )
      .join(" ");

  const getExactSpanLabels = (card) =>
    Array.from(card.querySelectorAll(".tag, .chip"))
      .map((span) => normalize(span.textContent || ""))
      .filter(Boolean);

  const setActiveFilter = (nextFilter) => {
    activeFilter = nextFilter;

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const cardMatchesFilter = (card, filter) => {
    if (filter === "all") {
      return true;
    }

    const normalizedFilter = normalize(filter);
    const spanLabels = getExactSpanLabels(card);
    const badgeText = normalize(getBadgeText(card));

    return (
      spanLabels.includes(normalizedFilter) ||
      badgeText.includes(normalizedFilter)
    );
  };

  const applyFilters = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchableText = normalize(
        [
          card.querySelector("h3")?.textContent || "",
          card.querySelector("p")?.textContent || "",
          getBadgeText(card),
          card.textContent || "",
        ].join(" ")
      );

      const matchesSearch = query === "" || searchableText.includes(query);
      const matchesFilter = cardMatchesFilter(card, activeFilter);
      const shouldShow = matchesSearch && matchesFilter;

      card.classList.toggle("is-hidden", !shouldShow);
      card.setAttribute("aria-hidden", String(!shouldShow));

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    resultCount.textContent = String(visibleCount);
    noResults.classList.toggle("is-visible", visibleCount === 0);
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveFilter(button.dataset.filter || "all");
      applyFilters();
    });
  });

  searchInput.addEventListener("input", applyFilters);

  setActiveFilter("all");
  applyFilters();
});
