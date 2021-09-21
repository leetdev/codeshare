import {languages} from '@codemirror/language-data'
import {Extension} from '@codemirror/state'

export const languageOptions = languages.map(description => description.name)

export const loadLanguage = async (index: number): Promise<Extension> => {
  return languages[index] ? (await languages[index].load()).extension : []
}
