const tagColors = [
  '#00ff00',
  '#ff0000',
  '#021aee',
  '#20c0ff',
  '#d602ee',
  '#ffff03',
  '#ff3d00',
  '#40ffff',
  '#ff0266',
  '#90ee02',
  '#80cbc4',
  '#bcaaa4',
  '#ee6002',
  '#709ddd',
  '#ffc107',
];

const mix = (start, end, percent) => {
  return start + percent * (end - start);
};

const mixColors = (color1, color2, percent) => {
  const red1 = parseInt(color1[1] + color1[2], 16);
  const green1 = parseInt(color1[3] + color1[4], 16);
  const blue1 = parseInt(color1[5] + color1[6], 16);

  const red2 = parseInt(color2[1] + color2[2], 16);
  const green2 = parseInt(color2[3] + color2[4], 16);
  const blue2 = parseInt(color2[5] + color2[6], 16);

  const red = Math.round(mix(red1, red2, percent));
  const green = Math.round(mix(green1, green2, percent));
  const blue = Math.round(mix(blue1, blue2, percent));

  const r = red.toString(16).padStart(2, '0');
  const g = green.toString(16).padStart(2, '0');
  const b = blue.toString(16).padStart(2, '0');
  return '#' + r + g + b;
};

/**
 * Returns all elements with classname "tag" and groups them in a Map by their text.
 */
const findTagGroups = () => {
  const tags = document.getElementsByClassName('tag');

  const tagGroups = new Map();
  for (let i = 0; i < tags.length; i++) {
    const text = tags[i].innerText;
    let group = tagGroups.get(text);
    if (!group) {
      group = { tags: [], color: tagColors[i % tagColors.length] };
    }
    tagGroups.set(text, { ...group, tags: [...group.tags, tags[i]] });
  }

  // Order map alphabetically so that duplicate colors are less likely to be adjacent
  return tagGroups;
};

const activeTags = new Set();

const handleMouseOverTag = ({ tags, color }) => () => {
  for (const tag of tags) {
    if (!activeTags.has(tag)) {
      tag.style.borderColor = mixColors(color, '#111111', 0.4);
      tag.style.backgroundColor = mixColors(color, '#111111', 0.7);
      tag.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#111111', 0.6)}`;
    }
  }
};

const activateTag = (tag, color) => {
  activeTags.add(tag);
  tag.classList.add('tag--active');
  tag.style.color = 'white';
  tag.style.borderColor = mixColors(color, '#111111', 0.3);
  tag.style.backgroundColor = mixColors(color, '#111111', 0.6);
  tag.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#111111', 0.4)}`;

  checkTagHighlightButton(tag);
};

const deactivateTag = (tag) => {
  activeTags.delete(tag);
  tag.classList.remove('tag--active');
  tag.style.color = null;
  tag.style.borderColor = null;
  tag.style.backgroundColor = null;
  tag.style.boxShadow = null;

  checkTagHighlightButton(tag);
};

const handleMouseOutTag = (tags) => () => {
  for (const tag of tags) {
    if (!activeTags.has(tag)) {
      deactivateTag(tag);
    }
  }
};

const handleClickTag = ({ tags, color }) => () => {
  for (const tag of tags) {
    if (activeTags.has(tag)) {
      deactivateTag(tag);
    } else {
      activateTag(tag, color);
    }
  }
};

const initTagHighlighting = () => {
  const groupedTags = findTagGroups().values();
  let i = 0;
  for (const tagGroup of groupedTags) {
    for (const tag of tagGroup.tags) {
      tag.addEventListener('mouseover', handleMouseOverTag(tagGroup));
      tag.addEventListener('mouseout', handleMouseOutTag(tagGroup.tags));
      tag.addEventListener('click', handleClickTag(tagGroup));
    }
    i++;
  }
};

const findTagHighlightButtons = () => {
  const highlightButtons = new Map();
  const buttons = document.getElementsByClassName('highlight-tags');
  for (const button of [...buttons]) {
    const tags = button.getAttribute('data-tags').split(',');
    highlightButtons.set(button, tags);
  }
  return highlightButtons;
};

const initTagHighlightButtons = () => {
  const tagGroups = findTagGroups();
  for (const [button, highlightTags] of findTagHighlightButtons().entries()) {
    button.addEventListener('click', () => {
      const isActive = button.classList.contains('highlight-tags--active');
      highlightTags.forEach((highlightTag) => {
        const { tags, color } = tagGroups.get(highlightTag);
        for (const tag of tags) {
          if (!isActive) {
            activateTag(tag, color);
          } else {
            deactivateTag(tag);
          }
        }
      });
    });
  }
};

/**
 * Checks if all tags of a highlight button are activated. If so adds the --active
 * class to the button, or removes it if there's at least one tag not higlighted.
 */
const checkTagHighlightButton = (tag) => {
  // All the lookups every time are a bit inefficient, but saw no performance issues.
  // Some better state management wouldn't hurt though.
  const buttons = Array.from(findTagHighlightButtons().entries());
  const result = buttons.find(([, buttonTags]) => buttonTags.includes(tag.innerText));
  if (!result) {
    return; // No highlight button for this tag exists
  }

  const tagGroups = findTagGroups();
  const [button, highlightTags] = result;
  const allTagsActive = highlightTags.every((highlightTag) =>
    tagGroups.get(highlightTag).tags.every((element) => activeTags.has(element))
  );

  if (allTagsActive) {
    button.classList.add('highlight-tags--active');
  } else {
    button.classList.remove('highlight-tags--active');
  }
};

window.addEventListener('load', () => {
  initTagHighlighting();
  initTagHighlightButtons();
});
