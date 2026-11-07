import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {Box, ButtonGroup, Divider, Flex, Grid, GridItem, Kbd, Spacer, Text, Textarea, VStack} from "@chakra-ui/react";
import useLanguage from "../hooks/useLanguage";
import { theme } from "../themes/theme";
import { DeleteIcon, ArrowBackIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { RiFileEditLine } from "react-icons/ri";
import { GrStatusInfo } from "react-icons/gr";

import CircleIconButton from "../common-components/form/CircleIconButton";
import ActionButton from "../common-components/form/ActionButton";
import InputBox from "../common-components/form/InputBox";
import DateInput from "../common-components/form/DateInput";
import Dropdown from "../common-components/form/Dropdown";
import TabGroup from "../common-components/navbar/TabGroup";
import InfoTooltip from "../common-components/popup/InfoTooltip";

const GROUPS_KEY = "aegis-quicksave-groups";
const EXPENSES_KEY = "aegis-saved-expenses";

const getToday = () => new Date().toLocaleDateString("en-CA");

export default function QuickSave() {
    const { DISPLAY, TOASTS } = useLanguage();
    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.EXPENSES, DISPLAY.TEXT.NOTEPAD];

    const [groups, setGroups] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(GROUPS_KEY)) || [];
        } catch {
            return [];
        }
    });

    const [groupInput, setGroupInput] = useState("");

    const rowId = useRef(0);

    const createRow = () => ({
        id: rowId.current++,
        spentDate: getToday(),
        spentAt: "",
        amount: 0,
        categoryIndex: 0
    });

    const [expenseMap, setExpenseMap] = useState(() => {
        const savedExpenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || {};
        const map = new Map();
        groups.forEach((_, index) => {
            const expenses = savedExpenses[index] || [];
            map.set(index, expenses.map(expense => ({
                ...expense,
                id: rowId.current++
            })));
        });
        const hasSavedExpenses = [...map.values()].some(expenses => expenses.length > 0);
        if (!hasSavedExpenses) {
            if (!map.has(0)) map.set(0, []);
            map.set(0, [createRow()]);
        }
        return map;
    });

    const [note, setNote] = useState(JSON.parse(localStorage.getItem("aegis-saved-notes")));

    const isEmptyExpense = expense => !expense.spentAt.trim() && Number(expense.amount) === 0;

    const resetExpenseMap = () => {
        const map = new Map();
        if (groups.length === 0) map.set(0, [createRow()]);
        else {
            groups.forEach((_, index) => {
                map.set(index, index === 0 ? [createRow()] : []);
            });
        }
        return map;
    };

    const addGroup = () => {
        const name = groupInput.trim();
        if (!name) return;

        if (groups.some(group => group.toLowerCase() === name.toLowerCase())) {
            toast.error(TOASTS.QUICK_SAVE.GROUP_ALREADY_EXISTS);
            return;
        }

        const updatedGroups = [...groups, name];
        setGroups(updatedGroups);
        localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));

        setExpenseMap(prev => {
            const next = new Map(prev);
            const newIndex = updatedGroups.length - 1;
            if (!next.has(newIndex)) {
                next.set(newIndex, []);
            }
            return next;
        });
        setGroupInput("");
    };

    const deleteGroup = groupIndex => {
        const groupExpenses = expenseMap.get(groupIndex) || [];
        const hasExpenses = groupExpenses.some(expense => !isEmptyExpense(expense));
        if (hasExpenses) return;

        const updatedGroups = groups.filter((_, index) => index !== groupIndex);
        setGroups(updatedGroups);
        localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));

        setExpenseMap(prev => {
            const next = new Map();
            prev.forEach((expenses, index) => {
                if (index === groupIndex) return;
                next.set(index > groupIndex ? index - 1 : index, expenses);
            });

            updatedGroups.forEach((_, index) => {
                if (!next.has(index)) next.set(index, []);
            });

            const hasRows = [...next.values()].some(rows => rows.length > 0);
            if (!hasRows) next.set(0, [createRow()]);
            return next;
        });
    };

    const addRow = () => {
        if (groups.length === 0) {
            return;
        }
    
        setExpenseMap(prev => {
            const next = new Map(prev);
            const lastGroupIndex = [...next.keys()]
                .filter(index => index < groups.length)
                .sort((a, b) => b - a)
                .find(index => (next.get(index) || []).length > 0);
    
            const lastRows = lastGroupIndex !== undefined ? next.get(lastGroupIndex) : [];
            const lastRow = lastRows[lastRows.length - 1];
    
            const newRow = {
                id: rowId.current++,
                spentDate: lastRow?.spentDate || getToday(),
                spentAt: "",
                amount: 0,
                categoryIndex: 0
            };
    
            const targetGroupIndex = lastGroupIndex ?? 0;
            next.set(targetGroupIndex, [
                ...(next.get(targetGroupIndex) || []),
                newRow
            ]);
            return next;
        });
    };

    const updateRow = (groupIndex, id, field, value) => {
        setExpenseMap(prev => {
            const next = new Map(prev);
            const rows = next.get(groupIndex) || [];
    
            next.set(groupIndex, rows.map(row =>
                row.id === id ? {
                        ...row,
                        [field]: field === "amount" ? Number(value) : value
                    } : row
            ));
            return next;
        });
    };

    const handleRowChange = (groupIndex, id) => e => {
        const { name, value } = e.target;
        updateRow(groupIndex, id, name, value);
    };

    const changeRowGroup = (oldGroupIndex, newGroupIndex, id) => {
        newGroupIndex = Number(newGroupIndex);

        if (oldGroupIndex === newGroupIndex) return;

        setExpenseMap(prev => {
            const next = new Map(prev);
            const oldRows = [...(next.get(oldGroupIndex) || [])];
            const rowIndex = oldRows.findIndex(row => row.id === id);

            if (rowIndex === -1) return prev;
            const [row] = oldRows.splice(rowIndex, 1);

            next.set(oldGroupIndex, oldRows);
            const newRows = [...(next.get(newGroupIndex) || [])];

            newRows.push(row);
            next.set(newGroupIndex, newRows);
            return next;
        });
    };

    const deleteRow = (groupIndex, id) => {
        setExpenseMap(prev => {
            const next = new Map(prev);
            const rows = (next.get(groupIndex) || []).filter(row => row.id !== id);
            next.set(groupIndex, rows);

            const totalRows = [...next.values()].reduce((sum, arr) => sum + arr.length, 0);
            if (totalRows === 0) {
                next.set(0, [createRow()]);
            }
            return next;
        });
    };

    const saveExpenses = () => {
        const expensesObject = {};
        let hasInvalidEntry = false;
    
        expenseMap.forEach((expenses, groupIndex) => {
            expensesObject[groupIndex] = [];
            expenses.forEach(expense => {
                if (isEmptyExpense(expense)) return;
                if (!expense.spentAt.trim() || expense.amount <= 0 || !expense.spentDate || !groups[groupIndex]) {
                    hasInvalidEntry = true;
                    return;
                }
                const { id, ...expenseData } = expense;
                expensesObject[groupIndex].push(expenseData);
            });
        });
    
        if (hasInvalidEntry) {
            toast.error(TOASTS.QUICK_SAVE.INVALID_EXPENSES_WARNING);
            return;
        }
        try {
            localStorage.setItem(EXPENSES_KEY, JSON.stringify(expensesObject));
            toast.success(TOASTS.QUICK_SAVE.EXPENSES_SAVED);
        } catch {
            toast.error(TOASTS.QUICK_SAVE.EXPENSE_SAVE_ERROR);
        }
    };

    const clearExpenses = () => {
        setExpenseMap(resetExpenseMap());
        localStorage.removeItem(EXPENSES_KEY);
    };

    const saveNotepad = async (e) => {
        localStorage.setItem("aegis-saved-notes", JSON.stringify(note));
        toast.success(TOASTS.QUICK_SAVE.NOTE_SAVED);
    };

    const clearNotePad = async (e) => {
        setNote("");
        localStorage.setItem("aegis-saved-notes", JSON.stringify(""));
    };

    const handleExpenseKeyDown = e => {
        if (e.shiftKey && e.key === "Enter") {
            if (e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
            if (!e.target.closest("[data-expense-row]")) return;
            e.preventDefault();
            addRow();
        }
    };

    return (
        <div className="common-page" style={{ display: "flex", flexDirection: "column", overflowY: "scroll" }}>
            <Flex align="center" justify="space-between" paddingBottom={theme.paddingL}>
                <RiFileEditLine color={theme.primary} style={{ marginLeft: theme.marginS, marginRight: theme.marginS }} />
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{ base: "center", sm: "left" }}>
                    {DISPLAY.LABELS.QUICK_SAVE}
                </Text>
                <Spacer />
                <ActionButton icon={<ArrowBackIcon />} name={DISPLAY.BUTTONS.HOME} onClick={() => navigate("/home")} customStyle={{ width: "fit-content" }} />
            </Flex>

            <Divider borderColor={theme.border} borderWidth="1px" marginBottom={theme.marginL} />

            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab} />

            {/* Expense Tab */}
            {selectedTab === 0 && (
                <Box marginTop={theme.marginL} onKeyDown={handleExpenseKeyDown}>
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 3fr" }} gap={theme.paddingL} alignItems="start">
                        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} background={theme.bg}>
                            <Flex alignItems='start' justifyContent='space-between'>
                                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                                    {DISPLAY.TEXT.EXPENSE_GROUPS}
                                </Text>
                                <InfoTooltip label={DISPLAY.TOOLTIPS.QUICK_SAVE_EXPENSE}>
                                    <InfoOutlineIcon color={theme.text}/>
                                </InfoTooltip>
                            </Flex>
                            
                            <form>
                                <Flex align="center" gap={theme.paddingS}>
                                    <Box flex={1} minWidth={0} marginTop={theme.marginL}>
                                        <InputBox type="text" label="Group Name" name="groupName" value={groupInput} onChange={e => setGroupInput(e.target.value)} maxLen={40} />
                                    </Box>
                                    <ActionButton name={DISPLAY.BUTTONS.ADD} onClick={addGroup} actionType="primary" disabled={!groupInput.trim()} customStyle={{ width: "fit-content" }}/>
                                </Flex>
                            </form>

                            <VStack align="stretch" spacing={theme.paddingS}>
                                {groups.length === 0 && <div style={{width:'100%', display:'flex', marginBottom: theme.marginL, justifyContent:'center'}}>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                                            {DISPLAY.TEXT.NO_DATA}
                                        </Text>
                                    </div>
                                }

                                {groups.map((group, index) => {
                                    const groupExpenses = expenseMap.get(index) || [];
                                    const hasExpenses = groupExpenses.some(expense => !isEmptyExpense(expense));

                                    return (
                                        <Flex key={`${group}-${index}`} align="center" justify="space-between" padding={theme.paddingS} paddingLeft={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={theme.radius} background={theme.cardBg}>
                                            <Text color={theme.text} fontSize={theme.textSize}>
                                                {group}
                                            </Text>
                                            <CircleIconButton
                                                icon={<DeleteIcon />}
                                                tooltip={hasExpenses ? DISPLAY.TOOLTIPS.REMOVE_EXPENSES_BEFORE_DELETE : DISPLAY.TOOLTIPS.DELETE}
                                                onClick={() => deleteGroup(index)}
                                                customStyle={{ opacity: hasExpenses ? 0.4 : 1, cursor: hasExpenses ? "not-allowed" : "pointer" }}
                                            />
                                        </Flex>
                                    );
                                })}
                            </VStack>
                        </Box>

                        <Box minWidth={0}>
                            <Flex justify="space-between" align="center" marginBottom={theme.marginL} wrap="wrap" gap={theme.paddingS}>
                                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                                    {DISPLAY.LABELS.EXPENSES}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    <Kbd bgColor={theme.cardBg} color={theme.textSecondary}>shift</Kbd> + <Kbd bgColor={theme.cardBg} color={theme.textSecondary}>enter</Kbd> {DISPLAY.TEXT.ADD_NEW_ROW}
                                </Text>
                            </Flex>

                            {groups.length === 0 && (
                                <Flex alignItems='center' padding={theme.paddingL} marginY={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} bgColor={theme.cardBg}>
                                    <GrStatusInfo fontSize='18px' color={theme.textSecondary} style={{marginRight: theme.marginL}} />
                                    <Text fontSize={theme.textSize} color={theme.text}>{DISPLAY.TEXT.ADD_GROUP_TO_START}</Text>
                                </Flex>
                            )}

                            <Box paddingBottom={theme.paddingS}>
                                {[...expenseMap.entries()].sort(([a], [b]) => a - b).flatMap(([groupIndex, expenses]) =>
                                        expenses.map(expense => (
                                            <Grid key={expense.id} data-expense-row templateColumns={{base: '1fr', md: "1fr 1.2fr"}} gap={theme.paddingS} alignItems="center" background={theme.bg}>
                                                <Grid templateColumns="1.1fr 1fr" gap={theme.paddingS}>
                                                    <Dropdown
                                                        value={String(groupIndex)}
                                                        onChange={e => changeRowGroup(groupIndex, e.target.value, expense.id)}
                                                        options={groups.map((group, index) => ({
                                                            label: group,
                                                            value: String(index)
                                                        }))}
                                                        placeholder="Select Expense Group"
                                                    />
                                                    
                                                    <div style={{marginBottom: '-20px', marginTop: '0'}}>
                                                        <DateInput
                                                            value={expense.spentDate}
                                                            name="spentDate"
                                                            onChange={handleRowChange(groupIndex, expense.id)}
                                                            label={DISPLAY.LABELS.SPENT_DATE}
                                                        />
                                                    </div>
                                                </Grid>

                                                <Grid templateColumns="1.1fr 1fr 42px" gap={theme.paddingS}>
                                                    <InputBox
                                                        type="text"
                                                        label={DISPLAY.LABELS.SPENT_AT}
                                                        name="spentAt"
                                                        value={expense.spentAt}
                                                        onChange={handleRowChange(groupIndex, expense.id)}
                                                        required={true}
                                                        maxLen={50}
                                                    />

                                                    <InputBox
                                                        type="number"
                                                        label={DISPLAY.LABELS.AMOUNT}
                                                        name="amount"
                                                        value={expense.amount}
                                                        onChange={handleRowChange(groupIndex, expense.id)}
                                                        required={true}
                                                        min={0}
                                                    />

                                                    <div style={{marginTop: '13px'}}>
                                                        <CircleIconButton
                                                            icon={<DeleteIcon />}
                                                            tooltip={DISPLAY.TOOLTIPS.DELETE}
                                                            onClick={() => deleteRow(groupIndex, expense.id)}
                                                        />
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        ))
                                    )
                                }
                            </Box>

                            <ButtonGroup width='100%'>
                                <ActionButton name={DISPLAY.BUTTONS.ADD_ROW} onClick={addRow} disabled={groups.length === 0} customStyle={{width: "100%"}} />
                                <ActionButton name={DISPLAY.BUTTONS.CLEAR_ALL} onClick={clearExpenses} />
                                <ActionButton name={DISPLAY.BUTTONS.SAVE} disabled={groups.length === 0} onClick={saveExpenses} actionType="primary" />
                            </ButtonGroup>
                        </Box>
                    </Grid>
                </Box>
            )}

            {/* Notepad Tab - Unchanged */}
            {selectedTab === 1 && (
                <Flex flex={1} flexDirection="column" marginTop={theme.spacing}>
                    <Textarea
                        value={note}
                        flex={1}
                        placeholder={DISPLAY.TEXT.WRITE_HERE}
                        onChange={e => setNote(e.target.value)}
                        resize="vertical"
                        maxLength={50000}
                        backgroundColor={theme.bg}
                        border={`1px solid ${theme.border}`}
                        borderRadius={`calc(2 * ${theme.radius})`}
                        color={theme.text}
                        _hover={{ borderColor: theme.border, boxShadow: "none" }}
                        _focus={{ borderColor: theme.primary, boxShadow: "none" }}
                    />

                    <Grid templateColumns={{ base: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} gap={theme.paddingL} width="100%" marginTop={theme.marginL} marginBottom={theme.marginS}>
                        <GridItem colStart={{ lg: 3 }}>
                            <ActionButton name={DISPLAY.BUTTONS.CLEAR_ALL} onClick={clearNotePad} />
                        </GridItem>

                        <GridItem>
                            <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveNotepad} actionType="primary" />
                        </GridItem>
                    </Grid>
                </Flex>
            )}
        </div>
    );
}
