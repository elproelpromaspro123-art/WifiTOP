// Lista de palabras prohibidas (malas palabras) en múltiples idiomas
// Mantén esto en español, inglés, etc.
const badWords = [
  // Español
  'pendejo', 'mierda', 'puta', 'puto', 'bastardo', 'hijo de puta',
  'cabrón', 'culo', 'coño', 'boludo', 'pelotudo', 'tarado',
  'idiota', 'estúpido', 'mongolo', 'discapacitado', 'retrasado',
  'maricón', 'joto', 'trolo', 'sapito', 'traidor',
  'negro', 'negrito', 'chino', 'indio', 'gitano',
  
  // English
  'fuck', 'shit', 'asshole', 'bastard', 'bitch', 'damn',
  'crap', 'hell', 'piss', 'cock', 'pussy', 'dick',
  'asshat', 'motherfucker', 'shithead', 'dumbass',
  'nigger', 'faggot', 'retard', 'whore', 'slut',
  
  // Variantes y abreviaciones
  'f**k', 'sh*t', 'a$$hole', 'b*tch', 'pusssy', 'dickhead'
]

/**
 * Verifica si una cadena contiene palabras prohibidas
 */
export function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  
  // Remover caracteres especiales que intentan evadir el filtro
  const cleanedText = lowerText.replace(/[0-9@!$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '')
  
  return badWords.some(word => {
    // Búsqueda de palabra completa
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return regex.test(cleanedText)
  })
}
