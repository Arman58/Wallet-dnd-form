import React, {useState} from 'react';
import {useDropzone} from 'react-dropzone';
import styles from './styles.module.css';
import {RiPlayListAddFill} from "@react-icons/all-files/ri/RiPlayListAddFill";
import {WalletRowVM} from '../types/models';


const Wallet: React.FC = () => {
    const [rows, setRows] = useState<WalletRowVM[]>([]);
    const [total, setTotal] = useState<number | undefined>(undefined);

    const addRow = () => {
        setRows([...rows, {wallet: '', amount: '', currency: 'USDT', error: ''}]);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        calculateTotal(newRows);
    };

    const handleInputChange = (index: number, field: keyof WalletRowVM, value: string) => {
        const newRows = [...rows];
        if (field === 'amount') {
            const validatedValue = value.replace(/[^0-9.,]/g, '');
            newRows[index][field] = validatedValue;
            newRows[index].currency = validatedValue.includes('USD') ? 'USD' : 'USDT';

            if (value !== validatedValue) {
                newRows[index].error = 'Only numbers, commas, and dots are allowed.';
            } else {
                newRows[index].error = '';
            }
        } else {
            newRows[index][field] = value;
        }
        setRows(newRows);
        calculateTotal(newRows);
    };

    const calculateTotal = (rows: WalletRowVM[]) => {
        const totalAmount = rows.reduce((acc, row) => {
            const amount = parseFloat(row.amount.replace(/,/g, '')) || 0;
            return acc + amount;
        }, 0);
        setTotal(totalAmount);
    };

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            parseFile(text);
        };
        reader.readAsText(file);
    };

    const parseFile = (text: string) => {
        const lines = text.trim().split('\n').slice(1); // Assuming the first line is header
        const parsedRows = lines.map(line => {
            const [wallet, amount, currency] = line.split('\t');
            return {
                wallet: wallet || '',
                amount: amount || '0',
                currency: (currency?.trim() === 'USD') ? 'USD' : 'USDT',
                error: ''
            };
        });
        setRows(parsedRows);
        calculateTotal(parsedRows);
    };

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    return (
        <div className={styles.container}>
            <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                <p>Перетащите файл сюда или нажмите для выбора файла</p>
            </div>
            <div className={styles.main}>
                <div className={styles.walletForm}>
                    {rows.map((row, index) => (

                        <div key={index} className={styles.row}>
                            <button onClick={() => removeRow(index)}
                                    className={`${styles.button} ${styles.removeButton}`}>
                                Remove row
                            </button>
                            <input
                                type="text"
                                value={row.wallet}
                                onChange={(e) => handleInputChange(index, 'wallet', e.target.value)}
                                className={styles.input}
                                placeholder="wallet address"
                            />
                            <div className={styles.amountInput}>
                                <input
                                    type="text"
                                    value={row.amount}
                                    onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                                    onBlur={(e) => handleInputChange(index, 'amount', e.target.value)}
                                    className={styles.input}
                                    placeholder="amount"
                                />
                                <span className={styles.currency}>{row.currency}</span>
                            </div>
                            {row.error && <div className={styles.error}>{row.error}</div>}

                        </div>
                    ))}
                </div>
                <div className={styles.row}>
                    <button onClick={addRow} className={`${styles.button} ${styles.addButton}`}><RiPlayListAddFill/> Add
                        Row
                    </button>
                </div>
                {total ? <div className={styles.total}>
                    <span> Total</span>
                    <span className={styles.totalCurrency}>{total} USDT </span>
                </div> : null}
            </div>

        </div>
    );
};

export default Wallet;
