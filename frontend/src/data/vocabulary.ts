// Vocabulary for Spell Assist — live word autocomplete while fingerspelling.
//
// Conventions:
// - Every entry is a single dictionary word (letters a–z only): fingerspelling
//   builds text letter-by-letter, so multi-word phrases don't fit the
//   prefix-matching model.
// - Within each category, words are ordered by descending commonness. The
//   position doubles as the frequency rank used to score suggestions
//   (earlier = more common), so no separate frequency numbers are needed.
// - Words must appear in exactly one category; the trie builder skips
//   accidental duplicates defensively (first category wins).

export type VocabularyCategory = 'greetings' | 'feelings' | 'food' | 'family' | 'school';

export const vocabulary: Record<VocabularyCategory, string[]> = {
  // Everyday conversation basics: hellos, question words, and the small
  // function words needed to build sentences while signing.
  greetings: [
    'hi', 'hello', 'hey', 'good', 'please', 'thank',
    'thanks', 'sorry', 'welcome', 'excuse', 'me', 'you',
    'your', 'my', 'name', 'nice', 'meet', 'how',
    'are', 'what', 'who', 'where', 'when', 'why',
    'which', 'yes', 'no', 'okay', 'morning', 'night',
    'bye', 'goodbye', 'later', 'soon', 'now', 'today',
    'tomorrow', 'yesterday', 'again', 'friend', 'new', 'old',
    'help', 'talk', 'speak', 'say', 'tell', 'ask',
    'answer', 'question', 'understand', 'know', 'think', 'mean',
    'want', 'need', 'call', 'fine', 'great', 'wonderful',
    'awesome', 'cool', 'sure', 'maybe', 'never', 'always',
    'sometimes', 'often', 'wait', 'slow', 'fast', 'more',
    'less', 'big', 'small', 'long', 'short', 'tall',
    'here', 'there', 'this', 'that', 'all', 'some',
    'none', 'one', 'two', 'three', 'first', 'next',
    'last', 'other', 'same', 'different', 'easy', 'hard',
    'true', 'false', 'real', 'right', 'wrong', 'ready',
    'done', 'start', 'stop', 'go', 'come', 'open',
    'close', 'give', 'take', 'find', 'look', 'see',
    'hear', 'guess', 'everyone', 'anyone', 'someone', 'nobody',
  ],

  // Emotions, sensations, and the words we use to talk about them.
  feelings: [
    'happy', 'sad', 'love', 'like', 'hate', 'mad',
    'angry', 'upset', 'tired', 'sleepy', 'hungry', 'thirsty',
    'sick', 'hurt', 'pain', 'scared', 'afraid', 'brave',
    'calm', 'relaxed', 'stressed', 'nervous', 'anxious', 'worried',
    'bored', 'excited', 'surprised', 'confused', 'curious', 'proud',
    'shy', 'embarrassed', 'jealous', 'guilty', 'grateful', 'thankful',
    'hopeful', 'lonely', 'loved', 'silly', 'serious', 'quiet',
    'loud', 'kind', 'cruel', 'friendly', 'rude', 'polite',
    'strong', 'weak', 'healthy', 'ill', 'dizzy', 'sore',
    'better', 'worse', 'best', 'worst', 'glad', 'joyful',
    'merry', 'cheerful', 'gloomy', 'miserable', 'delighted', 'pleased',
    'annoyed', 'frustrated', 'furious', 'terrible', 'awful', 'horrible',
    'bad', 'amazing', 'incredible', 'fantastic', 'perfect', 'energetic',
    'active', 'lazy', 'busy', 'free', 'full', 'empty',
    'warm', 'cold', 'hot', 'soft', 'safe', 'interested',
    'interesting', 'amazed', 'cry', 'smile', 'laugh', 'feel',
    'feeling', 'mood', 'emotion', 'worry', 'fear', 'joy',
    'anger', 'hope', 'peace', 'trust', 'fun', 'funny',
  ],

  // Fruits, dishes, ingredients, tastes, and kitchen words.
  food: [
    // Fruits
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
    'watermelon', 'peach', 'pear', 'plum', 'cherry', 'mango',
    'pineapple', 'lemon', 'lime', 'kiwi', 'melon', 'raisin',
    'apricot', 'avocado', 'coconut', 'papaya', 'fig',
    // Dishes & baked goods
    'bread', 'rice', 'noodle', 'pasta', 'pizza', 'burger',
    'sandwich', 'taco', 'sushi', 'soup', 'salad', 'cereal',
    'pancake', 'waffle', 'toast', 'dumpling', 'stew', 'chili',
    'biscuit', 'cracker', 'pretzel', 'muffin', 'brownie', 'cupcake',
    'donut', 'cookie', 'cake', 'pie', 'candy', 'chocolate',
    'honey', 'jam', 'syrup', 'sugar', 'dessert', 'snack',
    // Proteins & dairy
    'egg', 'cheese', 'butter', 'milk', 'yogurt', 'cream',
    'chicken', 'beef', 'pork', 'fish', 'shrimp', 'bacon',
    'ham', 'turkey', 'sausage', 'hotdog', 'nugget', 'fries',
    'steak', 'tofu',
    // Vegetables
    'carrot', 'potato', 'broccoli', 'spinach', 'lettuce', 'tomato',
    'cucumber', 'onion', 'garlic', 'pepper', 'corn', 'bean',
    'celery', 'mushroom', 'pea', 'pumpkin', 'cabbage', 'cauliflower',
    'zucchini', 'eggplant', 'radish', 'olive', 'beet', 'asparagus',
    // Drinks
    'water', 'juice', 'coffee', 'tea', 'soda', 'smoothie',
    'milkshake', 'lemonade', 'cocoa', 'cider', 'ice',
    // Seasonings & pantry
    'salt', 'oil', 'flour', 'dough', 'sauce', 'ketchup',
    'mustard', 'mayonnaise', 'gravy', 'vinegar', 'cinnamon', 'vanilla',
    // Meals, actions & tastes
    'breakfast', 'lunch', 'dinner', 'meal', 'picnic', 'barbecue',
    'feast', 'eat', 'drink', 'cook', 'bake', 'boil',
    'fry', 'grill', 'mix', 'stir', 'peel', 'wash',
    'chew', 'swallow', 'bite', 'share', 'taste', 'yummy',
    'delicious', 'gross', 'sweet', 'sour', 'salty', 'bitter',
    'spicy', 'fresh', 'ripe', 'rotten', 'raw', 'juicy',
    'crunchy', 'frozen', 'stale',
    // Kitchen & eating out
    'fork', 'knife', 'spoon', 'plate', 'bowl', 'cup',
    'glass', 'mug', 'bottle', 'straw', 'napkin', 'menu',
    'restaurant', 'cafe', 'kitchen', 'oven', 'stove', 'fridge',
    'microwave', 'dishwasher', 'sink', 'pantry', 'grocery', 'market',
    'store', 'receipt', 'order', 'tip', 'waiter', 'chef',
    'recipe', 'ingredient', 'leftover', 'lunchbox', 'thermos',
  ],

  // Family members, relationships, home, and celebrations.
  family: [
    'mom', 'mother', 'dad', 'father', 'mama', 'papa',
    'baby', 'brother', 'sister', 'sibling', 'son', 'daughter',
    'child', 'kid', 'family', 'grandma', 'grandpa', 'grandmother',
    'grandfather', 'grandparent', 'grandson', 'granddaughter', 'aunt', 'uncle',
    'cousin', 'niece', 'nephew', 'husband', 'wife', 'parent',
    'marriage', 'wedding', 'married', 'engaged', 'divorced', 'single',
    'home', 'house', 'apartment', 'room', 'bedroom', 'garden',
    'yard', 'door', 'window', 'roof', 'garage', 'fence',
    'pet', 'dog', 'cat', 'puppy', 'kitten', 'bird',
    'hamster', 'turtle', 'rabbit', 'neighbor', 'babysitter', 'care',
    'hug', 'kiss', 'birthday', 'party', 'gift', 'holiday',
    'christmas', 'easter', 'thanksgiving', 'halloween', 'vacation', 'trip',
    'travel', 'visit', 'together', 'young', 'age', 'born',
    'twin', 'relative', 'reunion', 'tradition', 'memory', 'photo',
    'picture', 'album',
  ],

  // Subjects, supplies, places, people, and actions around school.
  school: [
    'school', 'class', 'classroom', 'teacher', 'student', 'learn',
    'teach', 'study', 'read', 'write', 'spell', 'count',
    'math', 'number', 'science', 'history', 'english', 'art',
    'music', 'geography', 'chemistry', 'biology', 'physics', 'algebra',
    'geometry', 'spelling', 'grammar', 'word', 'letter', 'sentence',
    'story', 'page', 'chapter', 'book', 'textbook', 'library',
    'pencil', 'pen', 'eraser', 'ruler', 'paper', 'notebook',
    'crayon', 'marker', 'scissors', 'glue', 'tape', 'backpack',
    'desk', 'chair', 'table', 'computer', 'laptop', 'tablet',
    'keyboard', 'screen', 'whiteboard', 'worksheet', 'homework', 'assignment',
    'project', 'test', 'quiz', 'exam', 'grade', 'score',
    'report', 'principal', 'nurse', 'coach', 'janitor', 'cafeteria',
    'playground', 'hallway', 'locker', 'gym', 'recess', 'lesson',
    'practice', 'exercise', 'example', 'period', 'semester', 'year',
    'month', 'week', 'day', 'hour', 'minute', 'second',
    'time', 'clock', 'schedule', 'calendar', 'late', 'early',
    'absent', 'tardy', 'present', 'attention', 'listen', 'repeat',
    'remember', 'forget', 'erase', 'draw', 'paint', 'sing',
    'dance', 'play', 'game', 'sport', 'soccer', 'basketball',
    'baseball', 'football', 'tennis', 'swim', 'run', 'jump',
    'win', 'lose', 'team', 'group', 'partner', 'race',
    'field', 'court', 'ball', 'bat', 'glove', 'helmet',
    'experiment', 'lab', 'microscope', 'measure', 'data', 'chart',
    'map', 'globe', 'equation', 'problem', 'solution', 'add',
    'subtract', 'multiply', 'divide', 'campus', 'college', 'university',
    'rule', 'uniform', 'bell', 'flag',
  ],
};
