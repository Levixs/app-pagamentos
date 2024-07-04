import React, { useState } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import "moment/locale/pt-br";
import { styles } from "./indexStyle";

moment.locale("pt-br");

export default function ExpenseListScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(moment().format("DD/MM/YYYY"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment());

  const [nameError, setNameError] = useState("");
  const [amountError, setAmountError] = useState("");

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "months"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "months"));
  };

  const getFilteredExpenses = () => {
    return expenses.filter((expense) => {
      if (expense.dueDate) {
        const expenseDate = moment(expense.dueDate, "DD/MM/YYYY");
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
      setNameError("Nome da despesa é obrigatório");
      valid = false;
    } else {
      setNameError("");
    }

    const numericAmount = parseFloat(
      amount.replace(/[^\d,]/g, "").replace(",", ".")
    );
    if (!amount || isNaN(numericAmount)) {
      setAmountError("O valor deve ser um número válido");
      valid = false;
    } else {
      setAmountError("");
    }

    return valid;
  };

  const formatAmount = (value) => {
    const normalizedValue = value.replace(",", ".");

    const number = normalizedValue.replace(/[^0-9.]/g, "");

    if (isNaN(Number(number)) || !number) {
      return "";
    }

    const formattedNumber = parseFloat(number).toFixed(2);

    return formattedNumber;
  };

  const handleValorChange = (value) => {
    const numericValue = value.replace(/[^\d,]/g, "");

    const sanitizedValue = (
      parseInt(numericValue.replace(",", ""), 10) / 100
    ).toFixed(2);

    const formattedValue = Number(sanitizedValue).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setAmount(formattedValue.replace(".", ","));
  };

  const handleAddExpense = () => {
    if (!validateForm()) {
      return;
    }
    const cleanedAmount = amount.replace(/[^\d,]/g, "").replace(",", ".");
    const numericAmount = parseFloat(cleanedAmount);

    if (isNaN(numericAmount)) {
      setAmountError("O valor deve ser um número válido");
      return;
    }

    const formattedAmount = numericAmount.toFixed(2).replace(".", ",");

    const formattedDueDate = moment(dueDate).format("DD/MM/YYYY");

    if (isEditing && selectedExpense) {
      const updatedExpenses = expenses.map((expense) =>
        expense.id === selectedExpense.id
          ? {
              ...selectedExpense,
              name,
              amount: formattedAmount,
              dueDate: formattedDueDate,
              repeat,
            }
          : expense
      );
      setExpenses(updatedExpenses);
    } else {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          name,
          amount: formattedAmount,
          dueDate: formattedDueDate,
          repeat,
          isPaid: false,
        },
      ]);
    }

    clearForm();
    setModalVisible(false);
    setIsEditing(false);
  };

  const editExpense = () => {
    if (selectedExpense) {
      setName(selectedExpense.name);
      setAmount(
        parseFloat(selectedExpense.amount.replace(",", "."))
          .toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(".", ",")
      );
      setDueDate(moment(selectedExpense.dueDate, "DD/MM/YYYY").toDate());
      setRepeat(selectedExpense.repeat);
      setIsEditing(true);
      setModalVisible(true);
      setOptionsVisible(false);
    }
  };

  const markAsPaid = () => {
    if (selectedExpense) {
      const updatedExpenses = expenses.map((expense) =>
        expense.id === selectedExpense.id
          ? { ...expense, isPaid: true }
          : expense
      );
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
      const updatedExpenses = expenses.filter(
        (expense) => expense.id !== selectedExpense.id
      );
      setExpenses(updatedExpenses);
      setOptionsVisible(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const handleLongPress = (expense) => {
    setSelectedExpense(expense);
    setOptionsVisible(true);
  };

  const clearForm = () => {
    setName("");
    setAmount("");
    setDueDate(new Date());
    setRepeat(false);
    setNameError("");
    setAmountError("");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleLongPress(item)}>
      <View style={[styles.expenseItem, item.isPaid && styles.paidExpense]}>
        <View>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseDate}>{item.dueDate}</Text>
          {item.repeat && (
            <Text style={styles.expenseRepeat}>Repetir: Sim</Text>
          )}
          {item.isPaid && <Text style={styles.paidText}>Pago</Text>}
        </View>
        <Text style={styles.expenseAmount}>
          {parseFloat(item.amount).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Despesas</Text>
      </View>
      <View style={[styles.dateNav, styles.dateNavBackground]}>
        <TouchableOpacity
          style={styles.dateButtonLeft}
          onPress={handlePrevMonth}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {currentDate.format("MMMM [de] YYYY")}
        </Text>
        <TouchableOpacity
          style={styles.dateButtonRight}
          onPress={handleNextMonth}
        >
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={getFilteredExpenses()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Total a pagar</Text>
          <Text style={styles.footerAmount}>
            R${" "}
            {expenses
              .reduce(
                (sum, expense) => sum + parseFloat(expense.amount || "0"),
                0
              )
              .toFixed(2)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          clearForm();
          setModalVisible(true);
        }}
      >
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackground}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar Despesa" : "Adicionar Despesa"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da Despesa"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
              <TextInput
                style={styles.input}
                placeholder="Valor"
                value={amount}
                onChangeText={handleValorChange}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              {amountError ? (
                <Text style={styles.errorText}>{amountError}</Text>
              ) : null}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}
              >
                <RNDateTimePicker
                  style={styles.datePicker}
                  value={dueDate}
                  mode="date"
                  display="default"
                  locale="pt-BR"
                  onChange={onDateChange}
                />
                <Ionicons
                  name="calendar"
                  size={24}
                  color="#333"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
              {/* {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  dateFormat="day month year"
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
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleAddExpense}
                >
                  <Text style={styles.modalButtonText}>
                    {isEditing ? "Salvar" : "Adicionar"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalCancelButtonText,
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
            <TouchableOpacity
              style={styles.optionButton}
              onPress={changeDueDate}
            >
              <Text style={styles.optionButtonText}>Mudar Vencimento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={removeExpense}
            >
              <Text style={styles.optionButtonText}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setOptionsVisible(false)}
            >
              <Text style={styles.optionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
