import { useState } from 'react'
import TextField from '../ui/textField'
import Account from '@/components/icons/Account'

const TextFieldStyling = () => {
  // Stati per gestire i valori dei campi
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')

  // Handler per i campi
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 ~ handleBirthDateChange ~ e.target.value:', e.target.value)
    setBirthDate(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuantity(value === '' ? '' : Number(value))
  }

  return (
    <div className="w-full h-full p-4">
      <h1>Textfield Style Container</h1>
      <div className="grid grid-cols-2 gap-6 m-2">
        {/* Prima riga */}
        <div className="flex flex-col space-y-4">
          <TextField
            id="Title"
            leftIcon={<Account />}
            label="Title"
            helperText="Insert a title"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <TextField
            id="Pwd"
            type="password"
            label="Password"
            helperText="Insert your password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>

        {/* Seconda riga */}
        <div className="flex flex-col space-y-4">
          <TextField
            id="Date1"
            type="date"
            label="Birth date"
            dateFormat="dd-mm-yyyy"
            dateValueFormat="dd-mm-yyyy"
            helperText="Insert your birthday"
            value={birthDate}
            onChange={handleBirthDateChange}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <TextField
            id="Quantity"
            type="number"
            label="Quantity"
            helperText="Insert a number"
            placeholder="0"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
      </div>

      {/* Per debug - visualizzazione dei valori correnti */}
      <div className="mt-8 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-medium mb-2">Valori correnti:</h2>
        <p>
          <strong>Title:</strong> {title}
        </p>
        <p>
          <strong>Password:</strong> {password.replace(/./g, '*')}
        </p>
        <p>
          <strong>Birth date:</strong> {birthDate}
        </p>
        <p>
          <strong>Quantity:</strong> {quantity}
        </p>
      </div>
    </div>
  )
}

export default TextFieldStyling
