package com.recipeloop.app.viewmodel

import android.app.Application
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.recipeloop.app.data.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class AiChatViewModel(application: Application) : AndroidViewModel(application), TextToSpeech.OnInitListener {

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                role = "model",
                content = "Hello Chef! 🍳 I'm RecipeLoop AI, your personal culinary assistant and conversation partner. Ask me anything—whether it's cooking tips, meal ideas from what's in your fridge, ingredient substitutions, or everyday questions!"
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _inputText = MutableStateFlow("")
    val inputText: StateFlow<String> = _inputText.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening.asStateFlow()

    private val _readAloudEnabled = MutableStateFlow(true)
    val readAloudEnabled: StateFlow<Boolean> = _readAloudEnabled.asStateFlow()

    private val _speakingMessageId = MutableStateFlow<String?>(null)
    val speakingMessageId: StateFlow<String?> = _speakingMessageId.asStateFlow()

    private var speechRecognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(application, this)
        setupSpeechRecognizer()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            isTtsReady = true
        }
    }

    private fun setupSpeechRecognizer() {
        val app = getApplication<Application>()
        if (SpeechRecognizer.isRecognitionAvailable(app)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(app).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        _isListening.value = true
                    }
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {
                        _isListening.value = false
                    }
                    override fun onError(error: Int) {
                        _isListening.value = false
                    }
                    override fun onResults(results: Bundle?) {
                        _isListening.value = false
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            val spokenText = matches[0]
                            _inputText.value = spokenText
                            sendMessage(spokenText, isVoice = true)
                        }
                    }
                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            _inputText.value = matches[0]
                        }
                    }
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }
        }
    }

    fun onInputTextChange(text: String) {
        _inputText.value = text
    }

    fun toggleListening() {
        stopSpeaking()
        if (_isListening.value) {
            speechRecognizer?.stopListening()
            _isListening.value = false
        } else {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to RecipeLoop AI...")
            }
            try {
                speechRecognizer?.startListening(intent)
                _isListening.value = true
            } catch (e: Exception) {
                _isListening.value = false
            }
        }
    }

    fun toggleReadAloud() {
        stopSpeaking()
        _readAloudEnabled.value = !_readAloudEnabled.value
    }

    fun speakMessage(message: ChatMessage) {
        if (!isTtsReady) return
        stopSpeaking()

        val cleanText = message.content
            .replace(Regex("[*_#`~]"), "")
            .replace(Regex("[\uD83C-\uDBFF\uDC00-\uDFFF]"), "") // Remove emojis for clear TTS

        _speakingMessageId.value = message.id
        tts?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, message.id)
    }

    fun stopSpeaking() {
        tts?.stop()
        _speakingMessageId.value = null
    }

    fun resetConversation() {
        stopSpeaking()
        _messages.value = listOf(
            ChatMessage(
                role = "model",
                content = "Fresh start! What are we cooking or chatting about today, Chef?"
            )
        )
    }

    fun sendMessage(textOverride: String? = null, isVoice: Boolean = false) {
        val query = (textOverride ?: _inputText.value).trim()
        if (query.isEmpty() || _isLoading.value) return

        stopSpeaking()
        val userMsg = ChatMessage(role = "user", content = query, isVoiceInput = isVoice)
        _messages.value = _messages.value + userMsg
        _inputText.value = ""
        _isLoading.value = true

        viewModelScope.launch {
            val reply = generateAnswer(query)
            val modelMsg = ChatMessage(role = "model", content = reply)
            _messages.value = _messages.value + modelMsg
            _isLoading.value = false

            if (_readAloudEnabled.value) {
                speakMessage(modelMsg)
            }
        }
    }

    private suspend fun generateAnswer(prompt: String): String = withContext(Dispatchers.Default) {
        delay(600) // realistic typing delay
        val p = prompt.lowercase()

        when {
            p.contains("chicken") && p.contains("rice") -> {
                "🍗 **Quick Chicken & Rice Idea:**\n\nTry a **One-Pan Mediterranean Lemon Herb Chicken & Rice**!\n\n• **Ingredients:** Chicken thighs, 1 cup Basmati rice, 2 cups chicken broth, minced garlic, lemon juice, dried oregano, and olive oil.\n• **Method:** Sear seasoned chicken in a skillet for 6 mins. Remove, toast rice with garlic and oregano, pour in broth and lemon juice. Place chicken back on top, cover tightly, and simmer on low for 20 mins. Fluff and enjoy!"
            }
            p.contains("vegetarian") || p.contains("vegan") -> {
                "🥗 **Quick 20-Minute Vegetarian Dinner:**\n\n**Creamy Garlic Spinach & Chickpea Skillet**:\n\n1. Sauté sliced garlic, cherry tomatoes, and red pepper flakes in olive oil.\n2. Add 1 can of rinsed chickpeas and 3 cups of fresh baby spinach.\n3. Stir in 1/4 cup cream (or coconut cream) and a squeeze of fresh lemon.\n4. Serve hot with warm naan or toasted sourdough!"
            }
            p.contains("substitute") && (p.contains("heavy cream") || p.contains("cream")) -> {
                "🥛 **Substitutes for Heavy Cream:**\n\n1. **Milk + Butter:** Whisk 3/4 cup whole milk + 1/4 cup melted butter (best for cooking and sauces).\n2. **Coconut Cream:** 1:1 swap, wonderfully rich for curries, soups, and desserts.\n3. **Greek Yogurt + Milk:** Mix 50/50 for a tangy, creamy pasta sauce texture.\n4. **Silken Tofu:** Blend with a splash of soy milk for an ultra-smooth vegan alternative."
            }
            p.contains("pancake") || p.contains("fluffy") -> {
                "🥞 **Top Tips for Ultra-Fluffy Pancakes:**\n\n• **Do not overmix:** Lumps in the batter are completely fine. Overmixing activates gluten and makes pancakes dense.\n• **Let batter rest:** Rest for 10-15 minutes before cooking so the leavening agents aerate the mix.\n• **Separate & whip whites:** For soufflé-level fluffiness, fold whipped egg whites into the batter at the very end!"
            }
            p.contains("substitute") && (p.contains("egg") || p.contains("eggs")) -> {
                "🥚 **Egg Substitutes for Cooking & Baking:**\n\n• **For Baking Cakes/Muffins:** 1/4 cup unsweetened applesauce OR 1/2 mashed banana per egg.\n• **For Binding (Patties/Meatballs):** 1 tbsp ground flaxseed mixed with 2.5 tbsp water (let rest 5 mins).\n• **For Moisture:** 1/4 cup plain yogurt or buttermilk per egg."
            }
            p.contains("substitute") && (p.contains("butter")) -> {
                "🧈 **Butter Substitutes:**\n\n• **For Cooking & Sautéing:** Extra virgin olive oil or avocado oil (use a 3:4 ratio).\n• **For Baking:** Coconut oil (solid or melted 1:1) or Greek yogurt for half the butter amount."
            }
            p.contains("hello") || p.contains("hi") || p.contains("hey") -> {
                "Hello there! 👨‍🍳 What are we creating in the kitchen today? You can ask me for recipe recommendations, ingredient swaps, step-by-step cooking guidance, or tell me what's in your pantry!"
            }
            else -> {
                "That's a fantastic culinary question! Here is how to approach it:\n\n• **Flavor Balance:** Make sure you balance salt, acid (lemon or vinegar), fat (butter or olive oil), and heat for maximum depth.\n• **Technique:** Control your pan temperature—sear hot to develop a delicious crust, then drop heat to gently cook through without drying.\n\nWould you like a step-by-step recipe or tips tailored to any specific ingredients you have right now?"
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        speechRecognizer?.destroy()
        tts?.stop()
        tts?.shutdown()
    }
}
