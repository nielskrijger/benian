const tagConfig = {
  Languages: {
    tags: [
      'JavaScript',
      'TypeScript',
      'CoffeeScript',
      'Ruby',
      'C#',
      'Python',
      'Java',
      'PHP',
      'PL/SQL',
    ],
    color: '#00ff00',
  },
  Databases: {
    tags: [
      'Database Systems',
      'DynamoDB',
      'MySQL',
      'PostgreSQL',
      'Couchbase',
      'OracleDB',
      'MongoDB',
      'Redis',
    ],
    color: '#ff0000',
  },
  DevOps: {
    tags: [
      'NGINX',
      'AWS',
      'Chef',
      'Jenkins',
      'KOPS',
      'K8S',
      'Fleet',
      'Varnish',
      'Apache',
      'Heroku',
      'Google Cloud',
      'ELK',
    ],
    color: '#20c0ff',
  },
  Frameworks: {
    tags: [
      'Apollo',
      'Redux Toolkit',
      'Framer Motion',
      'J2EE',
      'AngularJS',
      'Ruby on Rails',
      'NodeJS',
      'React',
      'React Native',
      'Ionic',
      'Redux',
      'Doctrine',
      'Symfony',
      'Spring',
      'JPA',
    ],
    color: '#ffff03',
  },
  Apps: {
    tags: [
      'RabbitMQ',
      'Joomla CMS',
      'Drupal CMS',
      'Contentful CMS',
      'Mendix',
      'Adobe Photoshop',
      'Adobe InDesign',
      'JasperSoft BI',
      'GlassFish',
      'Oracle BPM',
      'Oracle SOA Suite',
      'Oracle WebCenter',
      'Oracle APEX',
      'Oracle Data Integrator',
      'Oracle BI Enterprise',
      'WebLogic',
    ],
    color: '#ee6002',
  },
  Api: {
    tags: ['GraphQL', 'SOAP', 'WSDL', 'Microservices', 'WebSockets', 'OpenAPI', 'OAuth', 'JWT'],
    color: '#d602ee',
  },
  Method: {
    tags: ['Social Network Analysis', 'Agile', 'Pattern Languages', 'Organizational Patterns'],
    color: '#999999',
  },
};

const activeTags = new Set();
const tagButtons = new Map();

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
 * Returns the tag config the tag is part of.
 */
const findTagConfig = (tag) => {
  for (const [, cfg] of Object.entries(tagConfig)) {
    const { tags } = cfg;
    if (tags && tags.includes(tag)) {
      return cfg;
    }
  }
  throw new Error(`No config found for "${tag}"`);
};

/**
 * Returns all elements with classname "tag" and groups them in a Map by their text.
 */
const findTagElementClusters = () => {
  const tags = document.getElementsByClassName('tag');

  const clusters = new Map();
  for (let i = 0; i < tags.length; i++) {
    const text = tags[i].innerText;
    let cluster = clusters.get(text);
    const color = findTagConfig(text).color;
    if (!cluster) {
      cluster = { elements: [], color: color };
    }
    clusters.set(text, { ...cluster, elements: [...cluster.elements, tags[i]] });
  }

  // Order map alphabetically so that duplicate colors are less likely to be adjacent
  return clusters;
};

const applyActiveStyle = (elm, color) => {
  elm.style.borderColor = mixColors(color, '#111111', 0.3);
  elm.style.backgroundColor = mixColors(color, '#111111', 0.6);
  elm.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#111111', 0.4)}`;
  elm.style.color = 'white';
};

const applyHoverStyle = (elm, color) => {
  elm.style.borderColor = mixColors(color, '#111111', 0.4);
  elm.style.backgroundColor = mixColors(color, '#111111', 0.7);
  elm.style.boxShadow = `1px 0 10px 1px ${mixColors(color, '#111111', 0.6)}`;
  elm.style.color = '#ccc';
};

const applyInactiveStyle = (elm) => {
  elm.style.removeProperty('border-color');
  elm.style.removeProperty('background-color');
  elm.style.removeProperty('box-shadow');
  elm.style.removeProperty('color');
};

const areAllTagsActive = (tags) => {
  const clusters = findTagElementClusters();
  return tags.every((highlightTag) =>
    clusters.get(highlightTag).elements.every((element) => activeTags.has(element))
  );
};

/**
 * Checks if all tags of a highlight button are activated. If so adds the --active
 * class to the button, or removes it if there's at least one tag not highlighted.
 */
const checkTagHighlightButton = (elm) => {
  const buttons = Array.from(tagButtons.entries());
  const result = buttons.find(([, { tags }]) => tags && tags.includes(elm.innerText));
  if (!result) {
    return; // No highlight button for this tag exists
  }

  const [button, { color, tags }] = result;

  if (areAllTagsActive(tags)) {
    applyActiveStyle(button, color);
    button.classList.add('highlight-tag-button--active');
  } else {
    applyInactiveStyle(button);
    button.classList.remove('highlight-tag-button--active');
  }
};

const handleMouseOverTag = ({ elements, color }) => () => {
  for (const elm of elements) {
    if (!activeTags.has(elm)) {
      applyHoverStyle(elm, color);
    }
  }
};

const activateTag = (elm, color) => {
  activeTags.add(elm);
  applyActiveStyle(elm, color);
  checkTagHighlightButton(elm);
};

const deactivateTag = (elm) => {
  activeTags.delete(elm);
  applyInactiveStyle(elm);
  checkTagHighlightButton(elm);
};

const handleMouseOutTag = (elements) => () => {
  for (const elm of elements) {
    if (!activeTags.has(elm)) {
      deactivateTag(elm);
    }
  }
};

const handleClickTag = ({ elements, color }) => () => {
  for (const elm of elements) {
    if (activeTags.has(elm)) {
      deactivateTag(elm);
    } else {
      activateTag(elm, color);
    }
  }
};

const initTagHighlighting = () => {
  const clusters = findTagElementClusters().values();
  let i = 0;
  for (const cluster of clusters) {
    for (const elm of cluster.elements) {
      elm.addEventListener('mouseover', handleMouseOverTag(cluster));
      elm.addEventListener('mouseout', handleMouseOutTag(cluster.elements));
      elm.addEventListener('click', handleClickTag(cluster));
    }
    i++;
  }
};

const initTagHighlightButtons = () => {
  const wrapper = document.getElementsByClassName('highlight-tag-buttons')[0];
  for (const [text, cfg] of Object.entries(tagConfig)) {
    const { color, tags } = cfg;
    const button = document.createElement('button');
    const clusters = findTagElementClusters();
    button.textContent = text;
    button.setAttribute('class', 'highlight-tag-button');
    button.addEventListener('mouseover', () => {
      applyHoverStyle(button, color);
      for (const tag of tags) {
        handleMouseOverTag(clusters.get(tag))();
      }
    });
    button.addEventListener('mouseout', () => {
      if (!areAllTagsActive(tags)) {
        applyInactiveStyle(button);
        for (const tag of tags) {
          handleMouseOutTag(clusters.get(tag).elements)();
        }
      }
    });
    button.addEventListener('click', () => {
      const isActive = button.classList.contains('highlight-tag-button--active');
      for (const tag of tags) {
        const { elements, color } = clusters.get(tag);
        for (const tag of elements) {
          if (!isActive) {
            activateTag(tag, color);
          } else {
            deactivateTag(tag);
          }
        }
      }
    });

    wrapper.appendChild(button);
    tagButtons.set(button, cfg);
  }
};

window.addEventListener('load', () => {
  initTagHighlighting();
  initTagHighlightButtons();
});
