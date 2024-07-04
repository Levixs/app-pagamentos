import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
// import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export default function ExpenseListScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment());

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, 'months'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, 'months'));
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      if (expense.dueDate) {
        const expenseDate = moment(expense.dueDate, 'DD/MM/YYYY');
        return (
          expenseDate.month() === currentDate.month() &&
          expenseDate.year() === currentDate.year()
        );
      }
      return false;
    });
  };



  const validateForm = () => {
    let valid = true;

    if (!name) {
      setNameError('Nome da despesa é obrigatório');
      valid = false;
    } else {
      setNameError('');
    }

    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!amount || isNaN(numericAmount)) {
      setAmountError('O valor deve ser um número válido');
      valid = false;
    } else {
      setAmountError('');
    }

    return valid;
  };

  const formatAmount = (value) => {
    const normalizedValue = value.replace(',', '.');

    const number = normalizedValue.replace(/[^0-9.]/g, '');

    if (isNaN(Number(number)) || !number) {
      return '';
    }

    const formattedNumber = parseFloat(number).toFixed(2);

    return formattedNumber;
  };

  const handleValorChange = (value) => {
    if (value === '') {
      setAmount('');
      return;
    }

    const numericValue = value.replace(/\D/g, "");
    const sanitizedValue = Math.min(parseInt(numericValue), 50000000);
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sanitizedValue / 100);
    setAmount(formattedValue);
  };


  const handleAddExpense = () => {
    if (!validateForm()) {
      return;
    }

    const formattedAmount = formatAmount(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    const formattedDueDate = moment(dueDate).format('DD/MM/YYYY');

    if (isEditing && selectedExpense) {
      const updatedExpenses = expenses.map(expense =>
        expense.id === selectedExpense.id ? { ...selectedExpense, name, amount: formattedAmount, dueDate: formattedDueDate, repeat } : expense
      );
      setExpenses(updatedExpenses);
    } else {
      setExpenses([...expenses, { id: Date.now().toString(), name, amount: formattedAmount, dueDate: formattedDueDate, repeat, isPaid: false }]);
    }

    clearForm();
    setModalVisible(false);
    setIsEditing(false);
  };


  const handleLongPress = (expense) => {
    setSelectedExpense(expense);
    setOptionsVisible(true);
  };

  const editExpense = () => {
    if (selectedExpense) {
      setName(selectedExpense.name);
      setAmount(selectedExpense.amount);
      setDueDate(moment(selectedExpense.dueDate, 'DD/MM/YYYY').toDate());
      setRepeat(selectedExpense.repeat);
      setIsEditing(true);
      setModalVisible(true);
      setOptionsVisible(false);
    }
  };


  const markAsPaid = () => {
    if (selectedExpense) {
      const updatedExpenses = expenses.map(expense => expense.id === selectedExpense.id ? { ...expense, isPaid: true } : expense);
      setExpenses(updatedExpenses);
      setOptionsVisible(false);
    }
  };

  const changeDueDate = () => {
    if (selectedExpense) {
      setDueDate(new Date(selectedExpense.dueDate || Date.now()));
      setShowDatePicker(true);
      setOptionsVisible(false);
    }
  };

  const removeExpense = () => {
    if (selectedExpense) {
      const updatedExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
      setExpenses(updatedExpenses);
      setOptionsVisible(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const clearForm = () => {
    setName('');
    setAmount('');
    setDueDate(new Date());
    setRepeat(false);
    setNameError('');
    setAmountError('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleLongPress(item)}>
      <View style={[styles.expenseItem, item.isPaid && styles.paidExpense]}>
        <View>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseDate}>{item.dueDate}</Text>
          {item.repeat && <Text style={styles.expenseRepeat}>Repetir: Sim</Text>}
          {item.isPaid && <Text style={styles.paidText}>Pago</Text>}
        </View>
        <Text style={styles.expenseAmount}>{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Despesas</Text>
      </View>
      <View style={[styles.dateNav, styles.dateNavBackground]}>
        <TouchableOpacity style={styles.dateButtonLeft} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{currentDate.format('MMMM [de] YYYY')}</Text>
        <TouchableOpacity style={styles.dateButtonRight} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={getFilteredExpenses()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Total a pagar</Text>
          <Text style={styles.footerAmount}>R$ {expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0).toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => { clearForm(); setModalVisible(true); }}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          clearForm();
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Despesa"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={amount}
              onChangeText={handleValorChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{moment(dueDate).format('DD/MM/YYYY')}</Text>
            </TouchableOpacity>
            {/* {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )} */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Repetir</Text>
              <Switch
                value={repeat}
                onValueChange={setRepeat}
                thumbColor={repeat ? "#34C759" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                ios_backgroundColor="#3e3e3e"
                style={styles.switch}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddExpense}>
                <Text style={styles.modalButtonText}>{isEditing ? 'Salvar' : 'Adicionar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => { setModalVisible(false); setIsEditing(false); }}>
                <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={optionsVisible}
        onRequestClose={() => {
          setOptionsVisible(!optionsVisible);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Opções</Text>
            <TouchableOpacity style={styles.optionButton} onPress={editExpense}>
              <Text style={styles.optionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={markAsPaid}>
              <Text style={styles.optionButtonText}>Colocar como Paga</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={changeDueDate}>
              <Text style={styles.optionButtonText}>Mudar Vencimento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={removeExpense}>
              <Text style={styles.optionButtonText}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, styles.cancelButton]} onPress={() => setOptionsVisible(false)}>
              <Text style={styles.optionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#008080',
    padding: 15,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  paidExpense: {
    backgroundColor: '#e0ffe0',
  },
  expenseName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  expenseRepeat: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  expenseAmount: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  paidText: {
    fontSize: 12,
    color: '#34C759',
    fontFamily: 'Poppins_400Regular',
  },
  footer: {
    backgroundColor: '#008080',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTextContainer: {
    flex: 1,
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  footerAmount: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF9800',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  datePickerButton: {
    height: 40,
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#dc3333',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalCancelButtonText: {
    color: '#fff',
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#008080',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  cancelButton: {
    backgroundColor: '#dc3333',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
    position: 'relative',
  },
  dateNavBackground: {
    backgroundColor: '#008080',
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  dateButtonLeft: {
    position: 'absolute',
    left: 10,
  },
  dateButtonRight: {
    position: 'absolute',
    right: 10,
  },
});
