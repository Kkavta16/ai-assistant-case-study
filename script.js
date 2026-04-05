const chatWindow = document.getElementById('chatWindow')
const chatForm = document.getElementById('chatForm')
const messageInput = document.getElementById('messageInput')
const charCounter = document.getElementById('charCounter')
const sendBtn = document.getElementById('sendBtn')
const modeSelect = document.getElementById('modeSelect')
const clearChatBtn = document.getElementById('clearChatBtn')
const loadingIndicator = document.getElementById('loadingIndicator')
const errorMessage = document.getElementById('errorMessage')
const welcomeModal = document.getElementById('welcomeModal')
const closeModalBtn = document.getElementById('closeModalBtn')

const MAX_CHARACTERS = 500
const STORAGE_KEY = 'ai-assistant-case-study-state'

let conversation = []
let currentMode = modeSelect.value
let isLoading = false
let replyTimeoutId = null

function closeWelcomeModal() {
  welcomeModal.classList.add('hidden')
}

function persistState() {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      conversation,
      currentMode,
    }),
  )
}

function restoreState() {
  const savedState = sessionStorage.getItem(STORAGE_KEY)

  if (!savedState) {
    return
  }

  try {
    const parsedState = JSON.parse(savedState)
    conversation = Array.isArray(parsedState.conversation)
      ? parsedState.conversation
      : []
    currentMode = parsedState.currentMode || modeSelect.value
    modeSelect.value = currentMode
  } catch (error) {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

function setError(message) {
  errorMessage.textContent = message
}

function updateComposerState() {
  const text = messageInput.value
  const length = text.length
  const trimmed = text.trim()
  const isTooLong = length > MAX_CHARACTERS
  const isEmpty = trimmed.length === 0

  charCounter.textContent = `${length} / ${MAX_CHARACTERS}`
  charCounter.classList.toggle('limit', isTooLong)

  if (isTooLong) {
    setError(`Message must be ${MAX_CHARACTERS} characters or fewer.`)
  } else if (length > 0 && isEmpty) {
    setError('Message cannot be empty.')
  } else {
    setError('')
  }

  sendBtn.disabled = isEmpty || isTooLong || isLoading
}

function appendMessage(type, label, content) {
  const message = document.createElement('article')
  message.className = `message ${type}`

  if (type === 'system') {
    const body = document.createElement('p')
    body.textContent = content
    message.appendChild(body)
  } else {
    const messageLabel = document.createElement('p')
    messageLabel.className = 'message-label'
    messageLabel.textContent = label

    const body = document.createElement('p')
    body.textContent = content

    message.appendChild(messageLabel)
    message.appendChild(body)
  }

  chatWindow.appendChild(message)
  chatWindow.scrollTop = chatWindow.scrollHeight
}

function renderConversation() {
  chatWindow.innerHTML = ''

  if (conversation.length === 0) {
    appendMessage(
      'assistant intro-message',
      'AI Assistant',
      'This chatbot currently uses mock replies, so please try simple messages like "Hi", "How are you?", or "Bye" to get a better experience.',
    )
    return
  }

  conversation.forEach(entry => {
    if (entry.type === 'system') {
      appendMessage('system', '', entry.content)
      return
    }

    appendMessage(entry.type, entry.label, entry.content)
  })

  if (isLoading) {
    chatWindow.scrollTop = chatWindow.scrollHeight
  }
}

function isGreeting(text) {
  return /^(hi|hii|hello|hey|good morning|good afternoon|good evening)\b/i.test(
    text,
  )
}

function getBasicIntent(text) {
  const normalized = text.trim().toLowerCase()

  if (
    /^(how are you|how are you doing|how r you|how are u)\??$/.test(normalized)
  ) {
    return 'how_are_you'
  }

  if (/^(what can you do|what do you do|help)\??$/.test(normalized)) {
    return 'capabilities'
  }

  if (/^(thank you|thanks|thx)$/.test(normalized)) {
    return 'thanks'
  }

  if (/^(bye|goodbye|see you|see ya)$/.test(normalized)) {
    return 'bye'
  }

  return null
}

function isShortMessage(text) {
  return text.split(/\s+/).filter(Boolean).length <= 4
}

function generateFriendlyReply(text) {
  const basicIntent = getBasicIntent(text)

  if (isGreeting(text)) {
    return "Hey there! I'm happy to help. Tell me what you need and we'll figure it out together."
  }

  if (basicIntent === 'how_are_you') {
    return "I'm doing well, thanks for asking! I'm here and ready to help with whatever you need."
  }

  if (basicIntent === 'capabilities') {
    return "I can help with ideas, rewriting, summaries, and simple chat replies in different tones. Just send me a message and I'll respond in the selected mode."
  }

  if (basicIntent === 'thanks') {
    return "You're very welcome! If you'd like, send another message and I'll keep helping."
  }

  if (basicIntent === 'bye') {
    return 'See you soon! Come back anytime if you need help.'
  }

  if (isShortMessage(text)) {
    return `Sure thing! About "${text}": I'd start with the simplest version first, then build on it if needed. If you want, I can turn that into a fuller draft too.`
  }

  return `Thanks for sharing that. For "${text}", I'd break it into a few clear steps, handle the most important part first, and then polish the details. If you'd like, I can also rewrite it in a more casual or more polished way.`
}

function generateProfessionalReply(text) {
  const basicIntent = getBasicIntent(text)

  if (isGreeting(text)) {
    return 'Hello. How may I assist you today?'
  }

  if (basicIntent === 'how_are_you') {
    return "I'm doing well, thank you. How may I assist you today?"
  }

  if (basicIntent === 'capabilities') {
    return 'I can assist with drafting, rewriting, summarizing, and responding in different communication styles based on the selected mode.'
  }

  if (basicIntent === 'thanks') {
    return "You're welcome. Please let me know if you need anything else."
  }

  if (basicIntent === 'bye') {
    return 'Goodbye. Feel free to return if you need further assistance.'
  }

  if (isShortMessage(text)) {
    return `Regarding "${text}", I recommend addressing the core objective first, then following with the most relevant supporting detail.`
  }

  return `Based on your message, the best approach is to define the objective, organize the response into clear points, and end with a practical next action. For "${text}", that structure would keep the reply focused and professional.`
}

function generateConciseReply(text) {
  const basicIntent = getBasicIntent(text)

  if (isGreeting(text)) {
    return 'Hi. What do you need?'
  }

  if (basicIntent === 'how_are_you') {
    return "I'm good. How can I help?"
  }

  if (basicIntent === 'capabilities') {
    return 'I can help with writing, summaries, and quick replies.'
  }

  if (basicIntent === 'thanks') {
    return "You're welcome."
  }

  if (basicIntent === 'bye') {
    return 'Goodbye.'
  }

  if (isShortMessage(text)) {
    return `Short answer: focus on "${text}" first.`
  }

  return `Keep it simple: state the goal, key point, and next step for "${text}".`
}

function generateMockReply(userText, mode) {
  const cleanedText = userText.trim()

  switch (mode) {
    case 'Friendly':
      return generateFriendlyReply(cleanedText)
    case 'Professional':
      return generateProfessionalReply(cleanedText)
    case 'Concise':
      return generateConciseReply(cleanedText)
    default:
      return `I received: "${cleanedText}".`
  }
}

function simulateAssistantReply(userText, mode) {
  isLoading = true
  loadingIndicator.classList.remove('hidden')
  persistState()
  sendBtn.disabled = true

  replyTimeoutId = window.setTimeout(() => {
    conversation.push({
      type: 'assistant',
      label: 'AI Assistant',
      content: generateMockReply(userText, mode),
    })

    renderConversation()
    isLoading = false
    replyTimeoutId = null
    loadingIndicator.classList.add('hidden')
    persistState()
    updateComposerState()
  }, 900)
}

modeSelect.addEventListener('change', () => {
  const selectedMode = modeSelect.value

  if (selectedMode !== currentMode) {
    currentMode = selectedMode
    conversation.push({
      type: 'system',
      content: `[ Mode changed to ${selectedMode} ]`,
    })
    persistState()
    renderConversation()
  }
})

messageInput.addEventListener('input', updateComposerState)

chatForm.addEventListener('submit', event => {
  event.preventDefault()

  const rawText = messageInput.value
  const text = rawText.trim()

  if (text.length === 0) {
    setError('Message cannot be empty.')
    updateComposerState()
    return
  }

  if (rawText.length > MAX_CHARACTERS) {
    setError(`Message must be ${MAX_CHARACTERS} characters or fewer.`)
    updateComposerState()
    return
  }

  setError('')

  conversation.push({
    type: 'user',
    label: 'You',
    content: text,
  })

  persistState()
  renderConversation()
  messageInput.value = ''
  updateComposerState()
  simulateAssistantReply(text, currentMode)
})

clearChatBtn.addEventListener('click', () => {
  if (replyTimeoutId) {
    window.clearTimeout(replyTimeoutId)
    replyTimeoutId = null
  }

  conversation = []
  isLoading = false
  setError('')
  messageInput.value = ''
  loadingIndicator.classList.add('hidden')
  persistState()
  renderConversation()
  updateComposerState()
})

closeModalBtn.addEventListener('click', closeWelcomeModal)

restoreState()
renderConversation()
updateComposerState()
