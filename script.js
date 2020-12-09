const tagColors = [
  '#00ff00',
  '#ff0000',
  '#021aee',
  '#30B0FF',
  '#d602ee',
  '#ffff03',
  '#FF3D00',
  '#40FFFF',
  '#ff0266',
  '#90ee02',
  '#80CBC4',
  '#BCAAA4',
  '#ee6002',
  '#607D8B',
  '#FFC107',
];

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

const mix = (start, end, percent) => {
  return start + percent * (end - start);
};

/**
 * Returns all elements with classname "tag" and groups them in a Map by their common text.
 */
const findTagGroups = () => {
  const tags = document.getElementsByClassName('tag');

  const groupedTags = new Map();
  for (let tag of tags) {
    const text = tag.innerText;
    if (!groupedTags.has(text)) {
      groupedTags.set(text, []);
    }
    groupedTags.set(text, [...groupedTags.get(text), tag]);
  }

  // Order map alphabetically so that duplicate colors are less likely to be adjacent
  return new Map([...groupedTags.entries()].sort());
};

const activeTags = [];

const handleMouseOverTag = (tags, color) => () => {
  for (const tag of tags) {
    if (!activeTags.includes(tag)) {
      tag.style.borderColor = mixColors(color, '#000000', 0.4);
      tag.style.backgroundColor = mixColors(color, '#000000', 0.7);
      tag.style.boxShadow = `1px 0px 10px 1px ${mixColors(color, '#000000', 0.6)}`;
    }
  }
};

const resetTagStyle = (tag) => {
  tag.style.borderColor = null;
  tag.style.backgroundColor = null;
  tag.style.boxShadow = null;
  tag.style.color = null;
};

const handleMouseOutTag = (tags) => () => {
  for (const tag of tags) {
    if (!activeTags.includes(tag)) {
      resetTagStyle(tag);
    }
  }
};

const handleClickTag = (tags, color) => () => {
  for (const tag of tags) {
    const index = activeTags.indexOf(tag);
    if (index > -1) {
      activeTags.splice(index, 1);
      resetTagStyle(tag);
    } else {
      activeTags.push(tag);
      tag.style.color = 'white';
      tag.style.borderColor = mixColors(color, '#000000', 0.3);
      tag.style.backgroundColor = mixColors(color, '#000000', 0.6);
      tag.style.boxShadow = `1px 0px 10px 1px ${mixColors(color, '#000000', 0.4)}`;
    }
  }
};

window.onload = () => {
  const groupedTags = findTagGroups().values();
  let i = 0;
  for (const tagGroup of groupedTags) {
    for (const tag of tagGroup) {
      tag.addEventListener(
        'mouseover',
        handleMouseOverTag(tagGroup, tagColors[i % tagColors.length])
      );
      tag.addEventListener('mouseout', handleMouseOutTag(tagGroup));
      tag.addEventListener('click', handleClickTag(tagGroup, tagColors[i % tagColors.length]));
    }
    i++;
  }
};
