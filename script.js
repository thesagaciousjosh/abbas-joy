const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNavigation');
const contactForm = document.getElementById('contactForm');
const postForm = document.getElementById('postForm');
const adminPassword = document.getElementById('adminPassword');
const adminGate = document.getElementById('adminGate');
const adminWorkspace = document.getElementById('adminWorkspace');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminLogout = document.getElementById('adminLogout');
const adminResetPanel = document.getElementById('adminResetPanel');
const passwordResetForm = document.getElementById('passwordResetForm');
const passwordResetMessage = document.getElementById('passwordResetMessage');
const passwordChangeForm = document.getElementById('passwordChangeForm');
const passwordChangeMessage = document.getElementById('passwordChangeMessage');
const postCategory = document.getElementById('postCategory');
const newCategory = document.getElementById('newCategory');
const addCategory = document.getElementById('addCategory');
const categoryList = document.getElementById('categoryList');
const postDateInput = document.getElementById('postDate');
const postTimeInput = document.getElementById('postTime');
const postEditor = document.getElementById('postEditor');
const editorToolbar = document.querySelector('.editor-toolbar');
const postsContainer = document.getElementById('postsContainer');
const postPreview = document.getElementById('postPreview');
const postArticle = document.getElementById('postArticle');
const editingPostId = document.getElementById('editingPostId');
const postImageInput = document.getElementById('postImage');
const postImageFileInput = document.getElementById('postImageFile');
const postImageAltInput = document.getElementById('postImageAlt');
const postImagePreviewWrap = document.getElementById('postImagePreviewWrap');
const postImagePreviewImage = document.getElementById('postImagePreviewImage');
const removePostImage = document.getElementById('removePostImage');
const imageUploadStatus = document.getElementById('imageUploadStatus');
const savePostButton = document.getElementById('savePostButton');
const cancelPostEdit = document.getElementById('cancelPostEdit');
const faqItems = document.querySelectorAll('.faq-item');

const API_PORT = '5510';
const MAX_SOURCE_IMAGE_BYTES = 10_000_000;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_OPTIMIZED_IMAGE_BYTES = 3_000_000;
const isLocalStaticPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  && window.location.port === '5500';
const API_BASE = window.location.protocol === 'file:' || isLocalStaticPreview
  ? `http://${window.location.hostname || 'localhost'}:${API_PORT}/api`
  : '/api';
const defaultCategories = ['Faith', 'Reflection', 'Education', 'Story', 'Inclusion', 'Music'];
const defaultPosts = [
  {
    id: 'post-1',
    title: 'The Becoming That Comes From Being Broken',
    category: 'Faith',
    date: 'May 27, 2026',
    dateValue: '2026-05-27',
    image: 'assets/blog-broken-becoming.jpg',
    imageAlt: 'Becca standing outdoors in a burgundy top',
    quote: 'In surrendering all to Jesus, let your heart be the first.',
    excerpt: 'A reflection on surrender, humility, and how God forms the heart through difficult moments.',
    body: `How God works on our hearts differently, depending on how broken we are, is a really deep experience.

There was this one time I kept getting hurt, coming from someone I held dear and respected. The offences were coming at me back to back and I just couldn't stand it anymore at some point. I wasn't having it at all.

Twas as if the more I prayed, the more tensed the situation got.

Somehow my breakthrough came but it was hard. This time I had to apologize for doing nothing actually. Logically I was right and I also deserved an apology but then, twas the other way round.

It felt like the little ego I had inside me after enduring it all was stripped off. I felt defeated and worn as I sent an apology text in tears.

The offences didn't stop abruptly but my attitude to them came differently.

I didn't quite understand what God was trying to do at that moment but now that I look back, I see the Becoming that comes from being Broken.

Though we might be called Christians, not everyone actually lives or wants to live like Christ did.

I meannnnnn, check out different scenarios in the Bible where Jesus endured the cross, despising the shame, hid in the temple, suffered like men just so He could die for our sins.

His ways will never be ours. Twill always be higher.

And if He must work on us and in us, we have to let Him.

In surrendering all to Jesus, let your heart be the first. Time, talent, treasures must then follow.

Also, JESUS IS COMING BACK AGAIN.

#signlanguage #faithfulfollowers #Jesusiscomingsoon #ABBAsJoy`
  },
  {
    id: 'post-2',
    title: 'The Art of Stillness',
    category: 'Reflection',
    date: 'May 27, 2026',
    dateValue: '2026-05-27',
    image: 'assets/blog-stillness.jpg',
    imageAlt: 'Black and white portrait of Becca',
    quote: 'For every moment of stillness, there is strength supplied.',
    excerpt: 'A thoughtful meditation on quietness, stillness, and learning to hear God with clarity.',
    body: `Let's talk about the slight difference between quietness and stillness.

Quietness can be a means to achieve stillness, but stillness is the state of being that encompasses a deeper sense of calmness and peace. It is not just about the absence of noise but about the absence of mental and emotional turmoil.

Think about this verse: "Be still and know that I am God!" Psalm 46:10. You would wonder at the power of not just being quiet but still. It is until then, you'll know.

It gives you a deeper sense of focus and clarity.

You can speak to yourself and to God and a deeper part of you resonates with it and your lips might not even move. God can speak to you and without any iota of doubt you know that this is God.

Stillness. Practise this for life.

His Word says, "He leads me beside the still waters." Psalm 23:2. Can you see it now? God leads.

You don't have to go to a serene garden if you can't afford it or a mountain top to gain quietness if you can't at the moment.

No words. No tongues. Nothing. Just focus on God and even if nothing happens after some minutes, don't be in a rush to leave. Carry your Bible and study.

Add a music playlist if you want to but do not be distracted or emotional about it. The goal is to experience God and you have to be broken.

So, in your room, try it. When walking or strolling, try it. Disconnect from the noise of the world and let your silence be loud enough to attract God. Then, connect.

Be sensitive to know when it's time to withdraw, stop talking and speak to God. You would wonder at the things He can give to you in moments of stillness. Luke 22:41,43.

Stillness doesn't make you a quiet person or perhaps change your personality. Rather, it takes you deeper with and in God.

To those whys and when rampaging your mind, quiet down and be still before your Maker. God has something to say.

For every moment of stillness, there is strength supplied.`
  },
  {
    id: 'post-3',
    title: 'Living In An Answered Prayer',
    category: 'Reflection',
    date: 'May 27, 2026',
    dateValue: '2026-05-27',
    image: 'assets/blog-balanced-grace.jpg',
    imageAlt: 'Becca smiling outdoors with sunglasses',
    quote: "These are the days we prayed for. I'm living in an answered prayer.",
    excerpt: 'A warm note on balance, discipline, tight schedules, and receiving fresh grace for each day.',
    body: `It's taking a lot of intentionality to be balanced and I'm tapping into the grace made available everyday because yesterday's own cannot cover for today. His strength is made perfect in my weakness.

These days, schedules are tighter. Looking forward to getting home from work; days of traffic and unexpected delays. The part you have to still cook with weary body and probably keep up with several readings and personal development.

Then, washing plates or clothes while listening to messages, because guarding my heart is very important, to soak in the Word. Nitoripe, time flies. So now, I'd rather sleep off listening to a message than a movie because yet again, time flies.

Spiritual growth and discipline nko. Managing how to stay in prayer and study the Word and check up and chill is quite a lot unno but His grace is sufficient, right?

These are the days we prayed for. I'm living in an answered prayer, someway, somehow.

Piece by piece, twill certainly make sense at the end. So, this phase is stretching me but I know it's for good and I'm so grateful Abba put me in it.

God knows what He's doing and He's holding my hands every step of the way.

For anyone going through this phase too, Ire o! I see God helping us already.

For we are Abba's babies and soldiers too.

#christian #AbbasJoy #livingsupernaturally #Jesuslovesyou #LetJesushelpyou`
  },
  {
    id: 'post-4',
    title: 'It Is Well',
    category: 'Faith',
    date: 'May 27, 2026',
    dateValue: '2026-05-27',
    image: 'assets/blog-it-is-well.jpg',
    imageAlt: 'Becca smiling outdoors in sunlight',
    quote: 'We do not only rejoice when things are going smoothly; we rejoice forevermore.',
    excerpt: 'A faith-filled reflection on declaring “It is well” with depth, action, and trust in God.',
    body: `It is well! This phrase is a very popular one.

I can't recollect the number of times I've said it and even thought about it. In situations that seem hopeless, in conditions that are obviously unpalatable, we just say it is well.

Some people suggest that it shouldn't be because it is clearly not well, so why should we declare that it is and try to deceive ourselves or run away from reality? But that is not the case.

Habakkuk 3:17-18 gives a solid reason.

There is a root, there is a story, there was a woman. A Shunammite in the Bible, 2 Kings 4:25-35, whose son was already dead but she ran to Elisha for help.

His servant, Gehazi, delivered the message of the prophet just before she got to him and asked, "Is it well with thee? Is it well with thy husband? Is it well with the child?" She replied, "It is well."

Things were definitely not well at that point. Her family was in a state of anguish and sorrow but she chose to declare positivity into her situation.

In verse 23, she told her husband that it shall be well because she believed she was coming back with testimonies, which eventually happened.

So, I hope we continually hold on to that understanding that we do not only rejoice when things are going smoothly but we rejoice forevermore. 1 Thessalonians 5:16.

Also, saying it with no depth or faith-backed actions will yield no effect. James 2:14,17,26.

If the Shunammite woman declared it and just sat back at home wailing, Prophet Elisha wouldn't have known because God did not speak to him about it.

We can move the hands of God with our disposition to life's challenges. You can, I can, we all can, as believers.

It might not make sense to those around us but we know that God is able to do exceedingly, abundantly above all that we ask or think. Ephesians 3:20.

#simplytrusting #ferventfaith #itiswell #JesusonlyJesusever #safeinthearmsofJesus #Jesuslovesyoumorethanyouknow`
  }
];

function setMenuState(isOpen) {
  if (!menuToggle || !primaryNav) return;
  primaryNav.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  const label = menuToggle.querySelector('.sr-only');
  if (label) label.textContent = isOpen ? 'Close navigation menu' : 'Open navigation menu';
}

function toggleMenu() {
  setMenuState(!primaryNav.classList.contains('open'));
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', toggleMenu);

  primaryNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && primaryNav.classList.contains('open')) {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840) setMenuState(false);
  });
}

faqItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.open = false;
      }
    });
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const serviceNeeded = formData.get('serviceNeeded');
    const preferredMode = formData.get('preferredMode');
    const location = formData.get('location');
    const message = formData.get('message');
    const subject = `Booking request from ${name}`;
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Service needed: ${serviceNeeded}`,
      `Preferred mode: ${preferredMode}`,
      `Location: ${location}`,
      '',
      'Message:',
      message
    ].join('\n');
    const mailtoUrl = `mailto:beckyofficial30@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  });
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

if (postDateInput && postTimeInput) {
  const now = new Date();
  postDateInput.value = getLocalDateValue(now);
  postTimeInput.value = now.toTimeString().slice(0, 5);
}

if (editorToolbar && postEditor) {
  editorToolbar.addEventListener('click', event => {
    const button = event.target.closest('button[data-command]');
    if (!button) return;

    postEditor.focus();
    const command = button.dataset.command;
    if (command === 'createLink') {
      const url = window.prompt('Enter the link URL');
      if (!url) return;
      const safeUrl = /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`;
      document.execCommand('createLink', false, safeUrl);
      return;
    }

    document.execCommand(command, false, null);
  });
}

document.querySelectorAll('[data-toggle-password]').forEach(button => {
  const input = document.querySelector(button.dataset.togglePassword);
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `Show ${input?.labels?.[0]?.textContent || 'password'}`);

  button.addEventListener('click', () => {
    if (!input) return;
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button.textContent = shouldShow ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(shouldShow));
    button.setAttribute('aria-label', `${shouldShow ? 'Hide' : 'Show'} ${input.labels?.[0]?.textContent || 'password'}`);
  });
});

if (addCategory && newCategory) {
  addCategory.addEventListener('click', async () => {
    const category = newCategory.value.trim();
    if (!category) return;

    const categories = await getCategories();
    const existing = categories.find(item => item.toLowerCase() === category.toLowerCase());
    if (existing) {
      await renderCategories(existing);
      newCategory.value = '';
      return;
    }

    try {
      await apiRequest('/categories', {
        method: 'POST',
        auth: true,
        body: { category }
      });
      await renderCategories(category);
    } catch (error) {
      window.alert(error.message);
    }
    newCategory.value = '';
  });

  newCategory.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCategory.click();
    }
  });
}

if (categoryList) {
  categoryList.addEventListener('click', async event => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;

    const category = button.dataset.category;
    try {
      await apiRequest(`/categories/${encodeURIComponent(category)}`, {
        method: 'DELETE',
        auth: true
      });
      await renderCategories();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

if (adminLoginForm && adminPassword) {
  adminLoginForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (adminLoginMessage) {
      adminLoginMessage.textContent = 'Checking password...';
    }

    try {
      await loginAdmin(adminPassword.value);
      adminPassword.value = '';
      setAdminUnlocked(true);
      if (adminLoginMessage) {
        adminLoginMessage.textContent = '';
      }
      await renderCategories();
      await renderPosts();
    } catch (error) {
      sessionStorage.removeItem('abbaJoyAdminToken');
      setAdminUnlocked(false);
      if (adminLoginMessage) {
        adminLoginMessage.textContent = error.message || 'Password could not be verified.';
      }
    }
  });
}

if (adminLogout) {
  adminLogout.addEventListener('click', async () => {
    const token = getAdminToken();
    if (token) {
      await apiRequest('/auth', {
        method: 'DELETE',
        auth: true
      }).catch(() => {});
    }
    sessionStorage.removeItem('abbaJoyAdminToken');
    if (adminPassword) {
      adminPassword.value = '';
      adminPassword.focus();
    }
    setAdminUnlocked(false);
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener('submit', async event => {
    event.preventDefault();
    const resetKey = document.getElementById('resetKey')?.value.trim();
    const newPassword = document.getElementById('resetNewPassword')?.value.trim();
    if (passwordResetMessage) {
      passwordResetMessage.textContent = 'Setting new password...';
    }

    try {
      await apiRequest('/password/reset', {
        method: 'POST',
        body: { resetKey, newPassword }
      });
      await loginAdmin(newPassword);
      if (adminPassword) adminPassword.value = '';
      setAdminUnlocked(true);
      passwordResetForm.reset();
      if (passwordResetMessage) {
        passwordResetMessage.textContent = 'Password updated. Admin is unlocked.';
      }
      await renderCategories();
      await renderPosts();
    } catch (error) {
      if (passwordResetMessage) {
        passwordResetMessage.textContent = error.message;
      }
    }
  });
}

if (passwordChangeForm) {
  passwordChangeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword')?.value.trim();
    const newPassword = document.getElementById('newAdminPassword')?.value.trim();
    if (passwordChangeMessage) {
      passwordChangeMessage.textContent = 'Changing password...';
    }

    try {
      await apiRequest('/password/change', {
        method: 'POST',
        body: { currentPassword, newPassword }
      });
      await loginAdmin(newPassword);
      if (adminPassword) adminPassword.value = '';
      passwordChangeForm.reset();
      if (passwordChangeMessage) {
        passwordChangeMessage.textContent = 'Password changed successfully.';
      }
    } catch (error) {
      if (passwordChangeMessage) {
        passwordChangeMessage.textContent = error.message;
      }
    }
  });
}

function getAdminPassword() {
  return (adminPassword?.value || '').trim();
}

function getAdminToken() {
  return sessionStorage.getItem('abbaJoyAdminToken') || '';
}

function setAdminUnlocked(isUnlocked) {
  if (!adminGate || !adminWorkspace) return;
  adminGate.hidden = isUnlocked;
  adminWorkspace.hidden = !isUnlocked;
}

async function apiRequest(path, options = {}) {
  const token = getAdminToken();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.auth && !token ? { 'x-admin-password': getAdminPassword() } : {})
      },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    throw new Error(`Admin server is not reachable. Start it with npm start, then open http://localhost:${API_PORT}/admin.html.`);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Password is incorrect.' : payload.error || 'Request failed');
  }
  return payload;
}

async function loginAdmin(password) {
  const payload = await apiRequest('/auth', {
    method: 'POST',
    body: { password }
  });
  if (payload.session?.token) {
    sessionStorage.setItem('abbaJoyAdminToken', payload.session.token);
  }
  return payload;
}

async function verifyAdminPassword() {
  if (!getAdminToken()) {
    throw new Error('Admin session has expired. Please log in again.');
  }
  await apiRequest('/auth', { auth: true });
}

async function getPosts(options = {}) {
  const includeDefaults = options.includeDefaults !== false;
  try {
    return await apiRequest('/posts');
  } catch (error) {
    return includeDefaults ? defaultPosts : [];
  }
}

async function getCategories() {
  try {
    const categories = await apiRequest('/categories');
    return [...new Set([...defaultCategories, ...categories])];
  } catch (error) {
    return defaultCategories;
  }
}

async function renderCategories(selectedCategory) {
  if (!postCategory || !categoryList) return;

  const categories = await getCategories();
  const posts = await getPosts();
  const usedCategories = new Set(posts.map(post => post.category));
  postCategory.innerHTML = categories
    .map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`)
    .join('');

  if (selectedCategory && categories.includes(selectedCategory)) {
    postCategory.value = selectedCategory;
  }

  categoryList.innerHTML = categories.map(category => {
    const isDefault = defaultCategories.includes(category);
    const isUsed = usedCategories.has(category);
    const canDelete = !isDefault && !isUsed;
    const note = isDefault ? 'Default' : isUsed ? 'In use' : 'Custom';

    return `
      <span class="category-chip">
        ${escapeHTML(category)}
        <small>${note}</small>
        ${canDelete ? `<button type="button" data-category="${escapeHTML(category)}" aria-label="Delete ${escapeHTML(category)}">×</button>` : ''}
      </span>
    `;
  }).join('');
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

let localImagePreviewUrl = '';

function getPublicImageUrl(imagePath) {
  const normalized = String(imagePath || '').replace(/^\/+/, '');
  if (!normalized) return '';
  if (isLocalStaticPreview && normalized.startsWith('uploads/')) {
    return `http://${window.location.hostname || 'localhost'}:${API_PORT}/${normalized}`;
  }
  return normalized;
}

function clearLocalImagePreviewUrl() {
  if (localImagePreviewUrl) {
    URL.revokeObjectURL(localImagePreviewUrl);
    localImagePreviewUrl = '';
  }
}

function showPostImagePreview(source, options = {}) {
  if (!postImagePreviewWrap || !postImagePreviewImage) return;
  clearLocalImagePreviewUrl();

  if (!source) {
    postImagePreviewImage.removeAttribute('src');
    postImagePreviewWrap.hidden = true;
    return;
  }

  if (options.localFile) {
    localImagePreviewUrl = URL.createObjectURL(source);
    postImagePreviewImage.src = localImagePreviewUrl;
  } else {
    postImagePreviewImage.src = getPublicImageUrl(source);
  }
  postImagePreviewImage.alt = postImageAltInput?.value.trim() || 'Selected featured image preview';
  postImagePreviewWrap.hidden = false;
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('Image could not be read')));
    reader.readAsDataURL(blob);
  });
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.addEventListener('load', () => {
      URL.revokeObjectURL(source);
      resolve(image);
    });
    image.addEventListener('error', () => {
      URL.revokeObjectURL(source);
      reject(new Error('Selected file is not a readable image'));
    });
    image.src = source;
  });
}

async function optimizePostImage(file) {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (!file.size || file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error('Choose an image smaller than 10 MB.');
  }

  const image = await loadImageFile(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot prepare the selected image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const optimizedBlob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/webp', 0.82);
  });
  if (!optimizedBlob) throw new Error('This browser could not optimize the selected image.');
  if (optimizedBlob.size > MAX_OPTIMIZED_IMAGE_BYTES) {
    throw new Error('The optimized image is still larger than 3 MB. Choose a smaller image.');
  }

  const extensionByType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'blog-image';
  const extension = extensionByType[optimizedBlob.type] || 'webp';

  return {
    fileName: `${baseName}.${extension}`,
    dataUrl: await readBlobAsDataUrl(optimizedBlob)
  };
}

async function uploadPostImage(file) {
  const preparedImage = await optimizePostImage(file);
  return apiRequest('/uploads', {
    method: 'POST',
    auth: true,
    body: preparedImage
  });
}

function formatPostBody(body = '') {
  return escapeHTML(body)
    .split(/\n{2,}/)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function sanitizeRichHTML(html = '') {
  const template = document.createElement('template');
  template.innerHTML = html;
  const allowedTags = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'I', 'P', 'STRONG', 'U']);

  template.content.querySelectorAll('*').forEach(element => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach(attribute => {
      const isSafeLink = element.tagName === 'A'
        && attribute.name === 'href'
        && /^(https?:|mailto:|tel:)/i.test(attribute.value);
      if (!isSafeLink) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return template.innerHTML.trim();
}

function getPostContent(post) {
  return post.bodyHtml ? sanitizeRichHTML(post.bodyHtml) : formatPostBody(post.body);
}

function formatPostDateTime(dateValue, timeValue) {
  if (!dateValue) {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const date = new Date(`${dateValue}T${timeValue || '00:00'}`);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  if (timeValue) {
    options.hour = 'numeric';
    options.minute = '2-digit';
  }
  return date.toLocaleString('en-US', options);
}

function getPostDateTime(post) {
  if (!post.dateValue) return '';
  return `${post.dateValue}${post.timeValue ? `T${post.timeValue}` : ''}`;
}

function updatePostPreview() {
  if (!postPreview) return;
  const title = document.getElementById('postTitle')?.value.trim();
  const category = postCategory?.value || 'Post';
  const excerpt = document.getElementById('postExcerpt')?.value.trim();
  const bodyHtml = sanitizeRichHTML(postEditor?.innerHTML || '');
  const bodyText = postEditor?.innerText.trim() || '';
  const date = formatPostDateTime(postDateInput?.value, postTimeInput?.value);
  const previewImage = postImagePreviewWrap && !postImagePreviewWrap.hidden
    ? postImagePreviewImage?.src
    : '';

  if (!title && !excerpt && !bodyText && !previewImage) {
    postPreview.innerHTML = '<p class="form-note">Start writing to preview the post.</p>';
    return;
  }

  postPreview.innerHTML = `
    ${previewImage ? `<img class="post-image" src="${escapeHTML(previewImage)}" alt="${escapeHTML(postImageAltInput?.value.trim() || title || 'Featured image preview')}" />` : ''}
    <p class="section-eyebrow">${escapeHTML(category)}</p>
    <h4>${escapeHTML(title || 'Untitled post')}</h4>
    <p class="post-meta"><time>${escapeHTML(date)}</time></p>
    ${excerpt ? `<blockquote class="post-quote-card">${escapeHTML(excerpt)}</blockquote>` : ''}
    <div class="post-body">${bodyHtml || formatPostBody(bodyText)}</div>
  `;
}

[
  document.getElementById('postTitle'),
  document.getElementById('postExcerpt'),
  postImageInput,
  postImageAltInput,
  postCategory,
  postDateInput,
  postTimeInput
].forEach(input => {
  input?.addEventListener('input', updatePostPreview);
  input?.addEventListener('change', updatePostPreview);
});

postImageFileInput?.addEventListener('change', () => {
  const file = postImageFileInput.files?.[0];
  if (!file) {
    showPostImagePreview(postImageInput?.value);
    updatePostPreview();
    return;
  }

  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type) || file.size > MAX_SOURCE_IMAGE_BYTES) {
    postImageFileInput.value = '';
    if (imageUploadStatus) {
      imageUploadStatus.textContent = allowedTypes.has(file.type)
        ? 'Choose an image smaller than 10 MB.'
        : 'Choose a JPG, PNG, or WebP image.';
    }
    showPostImagePreview(postImageInput?.value);
    updatePostPreview();
    return;
  }

  showPostImagePreview(file, { localFile: true });
  if (imageUploadStatus) imageUploadStatus.textContent = 'Image ready to upload.';
  updatePostPreview();
});

postImageAltInput?.addEventListener('input', () => {
  if (postImagePreviewImage) {
    postImagePreviewImage.alt = postImageAltInput.value.trim() || 'Selected featured image preview';
  }
});

removePostImage?.addEventListener('click', () => {
  if (postImageFileInput) postImageFileInput.value = '';
  if (postImageInput) postImageInput.value = '';
  if (imageUploadStatus) imageUploadStatus.textContent = 'Featured image removed.';
  showPostImagePreview('');
  updatePostPreview();
});

postEditor?.addEventListener('input', updatePostPreview);

async function renderPosts() {
  if (!postsContainer) return;
  const isAdminPage = Boolean(adminWorkspace);
  const posts = await getPosts({ includeDefaults: !isAdminPage });
  if (!posts.length) {
    postsContainer.innerHTML = '<p class="form-note">No posts yet. Add a new post to share content from Abba\'s Joy.</p>';
    return;
  }
  postsContainer.innerHTML = posts.map(post => `
    <article class="post-card">
      ${post.image ? `<img class="post-image" src="${escapeHTML(getPublicImageUrl(post.image))}" alt="${escapeHTML(post.imageAlt || post.title)}" loading="lazy" decoding="async" />` : ''}
      <div class="post-card-body">
        <h3>${escapeHTML(post.title)}</h3>
        <div class="post-meta"><strong>${escapeHTML(post.category)}</strong> · <time${getPostDateTime(post) ? ` datetime="${escapeHTML(getPostDateTime(post))}"` : ''}>${escapeHTML(post.date)}</time></div>
        ${post.quote ? `<blockquote class="post-quote-card">${escapeHTML(post.quote)}</blockquote>` : ''}
        <p>${escapeHTML(post.excerpt)}</p>
      </div>
      <div class="post-card-actions">
        <a class="btn btn-secondary" href="post.html?id=${encodeURIComponent(post.id)}" data-post-id="${escapeHTML(post.id)}">Read More</a>
        ${isAdminPage ? `
          <button class="btn btn-secondary" type="button" data-edit-post="${escapeHTML(post.id)}">Edit</button>
          <button class="btn btn-danger" type="button" data-delete-post="${escapeHTML(post.id)}">Delete</button>
        ` : ''}
      </div>
    </article>
  `).join('');

  postsContainer.querySelectorAll('a[data-post-id]').forEach(link => {
    link.addEventListener('click', () => {
      const post = posts.find(item => item.id === link.dataset.postId);
      if (post) sessionStorage.setItem('abbaJoySelectedPost', JSON.stringify(post));
    });
  });

  if (!isAdminPage) return;

  postsContainer.querySelectorAll('button[data-edit-post]').forEach(button => {
    button.addEventListener('click', () => {
      const post = posts.find(item => item.id === button.dataset.editPost);
      if (post) {
        startPostEdit(post);
      }
    });
  });

  postsContainer.querySelectorAll('button[data-delete-post]').forEach(button => {
    button.addEventListener('click', async () => {
      const post = posts.find(item => item.id === button.dataset.deletePost);
      if (!post) return;
      const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
      if (!confirmed) return;

      try {
        await apiRequest(`/posts/${encodeURIComponent(post.id)}`, {
          method: 'DELETE',
          auth: true
        });
        if (editingPostId?.value === post.id) {
          resetPostForm();
        }
        await renderCategories();
        await renderPosts();
      } catch (error) {
        window.alert(error.message);
      }
    });
  });
}

function startPostEdit(post) {
  if (!postForm || !postEditor) return;
  editingPostId.value = post.id;
  document.getElementById('postTitle').value = post.title || '';
  if (postCategory) postCategory.value = post.category || defaultCategories[0];
  document.getElementById('postExcerpt').value = post.excerpt || post.quote || '';
  if (postDateInput) postDateInput.value = post.dateValue || '';
  if (postTimeInput) postTimeInput.value = post.timeValue || '';
  if (postImageInput) postImageInput.value = post.image || '';
  if (postImageFileInput) postImageFileInput.value = '';
  if (postImageAltInput) postImageAltInput.value = post.imageAlt || '';
  if (imageUploadStatus) imageUploadStatus.textContent = '';
  showPostImagePreview(post.image || '');
  postEditor.innerHTML = post.bodyHtml ? sanitizeRichHTML(post.bodyHtml) : formatPostBody(post.body || '');
  if (savePostButton) savePostButton.textContent = 'Update Post';
  if (cancelPostEdit) cancelPostEdit.hidden = false;
  updatePostPreview();
  postForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('postTitle')?.focus();
}

function resetPostForm() {
  if (!postForm) return;
  postForm.reset();
  if (editingPostId) editingPostId.value = '';
  if (postEditor) postEditor.innerHTML = '';
  if (postImageInput) postImageInput.value = '';
  if (postImageFileInput) postImageFileInput.value = '';
  if (imageUploadStatus) imageUploadStatus.textContent = '';
  showPostImagePreview('');
  if (postDateInput && postTimeInput) {
    const now = new Date();
    postDateInput.value = getLocalDateValue(now);
    postTimeInput.value = now.toTimeString().slice(0, 5);
  }
  if (savePostButton) savePostButton.textContent = 'Publish';
  if (cancelPostEdit) cancelPostEdit.hidden = true;
  updatePostPreview();
}

async function renderPostPage() {
  if (!postArticle) return;
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const posts = await getPosts();
  const post = posts.find(item => item.id === postId);

  if (!post) {
    postArticle.innerHTML = `
      <div class="container">
        <a class="blog-back-link" href="blog.html">Back to Blog</a>
        <h1>Post not found</h1>
        <p class="hero-text">This post may have moved or is no longer available.</p>
      </div>
    `;
    document.title = "Post not found | Abba's Joy";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'The requested Abba’s Joy blog post could not be found.';
    return;
  }

  document.title = `${post.title} | Abba's Joy Blog`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = post.excerpt || post.quote || `Read ${post.title} on the Abba’s Joy blog.`;
  postArticle.innerHTML = `
    <div class="container blog-article-inner">
      <a class="blog-back-link" href="blog.html">Back to Blog</a>
      ${post.image ? `<img class="blog-article-image" src="${escapeHTML(getPublicImageUrl(post.image))}" alt="${escapeHTML(post.imageAlt || post.title)}" decoding="async" />` : ''}
      <p class="section-eyebrow">${escapeHTML(post.category)}</p>
      <h1>${escapeHTML(post.title)}</h1>
      <p class="post-meta"><time${getPostDateTime(post) ? ` datetime="${escapeHTML(getPostDateTime(post))}"` : ''}>${escapeHTML(post.date)}</time></p>
      ${post.quote ? `<blockquote class="post-quote-card blog-article-quote">${escapeHTML(post.quote)}</blockquote>` : ''}
      <div class="post-body blog-article-body">${getPostContent(post)}</div>
    </div>
  `;
}

if (postForm) {
  postForm.addEventListener('submit', async event => {
    event.preventDefault();
    const postId = editingPostId?.value.trim();
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const bodyHtml = sanitizeRichHTML(postEditor?.innerHTML || '');
    const bodyText = postEditor?.innerText.trim() || '';
    const dateValue = postDateInput?.value;
    const timeValue = postTimeInput?.value;
    let image = postImageInput?.value.trim() || '';
    const selectedImageFile = postImageFileInput?.files?.[0];
    const imageAlt = postImageAltInput?.value.trim() || '';
    if (!bodyText) {
      postEditor?.focus();
      return;
    }
    const date = formatPostDateTime(dateValue, timeValue);
    const newPost = {
      title,
      category,
      date,
      dateValue,
      timeValue,
      excerpt,
      body: bodyText,
      bodyHtml,
      quote: excerpt,
      image,
      imageAlt: image ? imageAlt || title : ''
    };
    let savedPost;
    const saveLabel = postId ? 'Update Post' : 'Publish';
    if (savePostButton) {
      savePostButton.disabled = true;
      savePostButton.textContent = selectedImageFile ? 'Uploading Image...' : 'Saving...';
    }
    try {
      if (selectedImageFile) {
        const uploadedImage = await uploadPostImage(selectedImageFile);
        image = uploadedImage.path;
        newPost.image = image;
        newPost.imageAlt = imageAlt || title;
        if (postImageInput) postImageInput.value = image;
        if (imageUploadStatus) imageUploadStatus.textContent = 'Image uploaded.';
      }
      savedPost = await apiRequest(postId ? `/posts/${encodeURIComponent(postId)}` : '/posts', {
        method: postId ? 'PUT' : 'POST',
        auth: true,
        body: newPost
      });
    } catch (error) {
      window.alert(error.message);
      return;
    } finally {
      if (savePostButton) {
        savePostButton.disabled = false;
        savePostButton.textContent = saveLabel;
      }
    }
    await renderCategories(category);
    await renderPosts();
    resetPostForm();
    window.location.href = `post.html?id=${encodeURIComponent(savedPost.id)}`;
  });
}

if (cancelPostEdit) {
  cancelPostEdit.addEventListener('click', resetPostForm);
}

function revealOnScroll() {
  const elements = document.querySelectorAll('.section, .post-card, .service-card, .info-card, .detail-card, .media-card, .contact-form-card');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('reveal-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  elements.forEach(el => {
    el.classList.add('reveal-hidden');
    observer.observe(el);
  });
}

async function initializeAdminAccess() {
  if (!adminGate || !adminWorkspace) return;
  setAdminUnlocked(false);
  sessionStorage.removeItem('abbaJoyAdminPassword');

  if (!getAdminToken()) return;

  try {
    await verifyAdminPassword();
    setAdminUnlocked(true);
  } catch (error) {
    sessionStorage.removeItem('abbaJoyAdminToken');
    setAdminUnlocked(false);
  }
}

async function initializeAdminRecovery() {
  if (!adminResetPanel) return;

  try {
    const config = await apiRequest('/auth/config');
    adminResetPanel.hidden = !config.resetEnabled;
  } catch {
    adminResetPanel.hidden = true;
  }
}

initializeAdminAccess();
initializeAdminRecovery();
renderCategories();
renderPosts();
renderPostPage();
updatePostPreview();
revealOnScroll();
