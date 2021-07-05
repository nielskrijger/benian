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
const findTagClusters = () => {
  const tags = document.getElementsByClassName('tag');

  const clusters = new Map();
  for (let i = 0; i < tags.length; i++) {
    const text = tags[i].innerText;
    let group = clusters.get(text);
    const color = findTagConfig(text).color;
    if (!group) {
      group = { tags: [], color: color };
    }
    clusters.set(text, { ...group, tags: [...group.tags, tags[i]] });
  }

  // Order map alphabetically so that duplicate colors are less likely to be adjacent
  return clusters;
};

/**
 * Checks if all tags of a highlight button are activated. If so adds the --active
 * class to the button, or removes it if there's at least one tag not highlighted.
 */
const checkTagHighlightButton = (tag) => {
  const buttons = Array.from(tagButtons.entries());
  const result = buttons.find(([, { tags }]) => tags && tags.includes(tag.innerText));
  if (!result) {
    return; // No highlight button for this tag exists
  }

  const clusters = findTagClusters();
  const [button, { tags }] = result;
  const allTagsActive = tags.every((highlightTag) =>
    clusters.get(highlightTag).tags.every((element) => activeTags.has(element))
  );

  if (allTagsActive) {
    button.classList.add('highlight-tag-button--active');
  } else {
    button.classList.remove('highlight-tag-button--active');
  }
};

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
  const groupedTags = findTagClusters().values();
  let i = 0;
  for (const group of groupedTags) {
    for (const tag of group.tags) {
      tag.addEventListener('mouseover', handleMouseOverTag(group));
      tag.addEventListener('mouseout', handleMouseOutTag(group.tags));
      tag.addEventListener('click', handleClickTag(group));
    }
    i++;
  }
};

const initTagHighlightButtons = () => {
  const wrapper = document.getElementsByClassName('highlight-tag-buttons')[0];
  for (const [text, cfg] of Object.entries(tagConfig)) {
    const { tags } = cfg;
    const button = document.createElement('button');
    button.textContent = text;
    button.setAttribute('class', 'highlight-tag-button');
    button.addEventListener('click', () => {
      const clusters = findTagClusters();
      const isActive = button.classList.contains('highlight-tag-button--active');
      tags.forEach((tag) => {
        const { tags, color } = clusters.get(tag);
        for (const tag of tags) {
          if (!isActive) {
            activateTag(tag, color);
          } else {
            deactivateTag(tag);
          }
        }
      });
    });

    wrapper.appendChild(button);
    tagButtons.set(button, cfg);
  }
};

window.addEventListener('load', () => {
  initTagHighlighting();
  initTagHighlightButtons();
});
