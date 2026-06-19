import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json'
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { createHash, createPassKey, decryptData, encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { MdRefresh } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { BsCalendarWeek, BsCalendarRange } from "react-icons/bs";
import { AiOutlineFileAdd } from "react-icons/ai";

import ActionButton from "../../common-components/form/ActionButton";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Loading from "../../common-components/Loading";
import PinModal from "../../common-components/PinModal";
import TabGroup from "../../common-components/navbar/TabGroup";
import CollectionsTab from "./CollectionsTab";


export default function PlannerVault() {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey} = useAppContext();
    const navigate = useNavigate();

    const [collectionData, setCollectionData] = useState(null);
    const [journalMetadata, setJournalMetadata] = useState(null);
    const [noteMetadata, setNoteMetadata] = useState(null);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [taskData, setTaskData] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

    const [refreshCollections, setRefreshCollections] = useState(false);
    const [refreshJournalMetadata, setRefreshJournalMetadata] = useState(false);
    const [refreshNoteMetadata, setRefreshNoteMetadata] = useState(false);
    const [refreshSchedule, setRefreshSchedule] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(false);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // use this to disable buttons not to show <Loading/>

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.COLLECTIONS, DISPLAY.LABELS.CALENDAR, DISPLAY.LABELS.NOTES];

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);


    // for fetching all collections
    useEffect(() =>{
        if(!masterKey) return;
        async function fetchCollections(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/pl/collections',
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedCollections = []; //one entry per collection
                    for(const collection of res?.data?.collections){
                        const collectionObj = {
                            type: collection.type,
                            collectionData: JSON.parse(await decryptData(collection.collectionData, collection.nonce, masterKey))
                        }
                        decryptedCollections.push(collectionObj);
                    }
                    setCollectionData(decryptedCollections);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchCollections();
    }, [refreshCollections, masterKey]);
    

    // for fetching journal metadata
    useEffect(() =>{
        if(!masterKey) return;
        async function fetchJournalMetadata(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/pl/journal-metadata',
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedMetadata = JSON.parse(await decryptData(res.data.metadata.metadataData, res.data.metadata.nonce, masterKey));
                    setJournalMetadata(decryptedMetadata);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchJournalMetadata();
    }, [refreshJournalMetadata, masterKey]);
    

    // for fetching note metadata
    useEffect(() =>{
        if(!masterKey) return;
        async function fetchNoteMetadata(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/pl/note-metadata',
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedMetadata = JSON.parse(await decryptData(res.data.metadata.metadataData, res.data.metadata.nonce, masterKey));
                    setNoteMetadata(decryptedMetadata);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchNoteMetadata();        
    }, [refreshNoteMetadata, masterKey]);


    // for fetching weekly schedule
    useEffect(() =>{
        if(!masterKey) return;
        async function fetchWeeklySchedule(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/pl/weekly-schedule',
                setIsLoading,
                onSuccess: async(res) =>{
                    setWeeklySchedule({
                        monday: JSON.parse(await decryptData(res.data.schedule.mondayScheduleData, res.data.schedule.mondayNonce, masterKey)),
                        tuesday: JSON.parse(await decryptData(res.data.schedule.tuesdayScheduleData, res.data.schedule.tuesdayNonce, masterKey)),
                        wednesday: JSON.parse(await decryptData(res.data.schedule.wednesdayScheduleData, res.data.schedule.wednesdayNonce, masterKey)),
                        thursday: JSON.parse(await decryptData(res.data.schedule.thursdayScheduleData, res.data.schedule.thursdayNonce, masterKey)),
                        friday: JSON.parse(await decryptData(res.data.schedule.fridayScheduleData, res.data.schedule.fridayNonce, masterKey)),
                        saturday: JSON.parse(await decryptData(res.data.schedule.saturdayScheduleData, res.data.schedule.saturdayNonce, masterKey)),
                        sunday: JSON.parse(await decryptData(res.data.schedule.sundayScheduleData, res.data.schedule.sundayNonce, masterKey))
                    });
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchWeeklySchedule();
    }, [refreshSchedule, masterKey]);


    // for fetching tasks of selected date
    useEffect(() =>{
        if(!masterKey || !selectedDate) return;
        async function fetchTasks(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/pl/tasks/${selectedDate}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedTasks = []; // all tasks for the selected date
                    for(const task of res?.data?.tasks){
                        const taskMetadata = JSON.parse(await decryptData(task.taskMetadata, task.metadataNonce, masterKey));
                        taskMetadata.taskDate = task.taskDate;
                        taskMetadata.id = task._id;
                        taskMetadata.description = task.taskDescription;
                        taskMetadata.descriptionNonce = task.descriptionNonce;
                        decryptedTasks.push(taskMetadata);
                    }
                    setTaskData(decryptedTasks);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchTasks();
    }, [refreshTasks, selectedDate, masterKey]);


    const refreshPage = (e) =>{
        setRefreshCollections(!refreshCollections);
        setRefreshJournalMetadata(!refreshJournalMetadata);
        setRefreshNoteMetadata(!refreshNoteMetadata);
        setRefreshSchedule(!refreshSchedule);
        setRefreshTasks(!refreshTasks);
    }


    if(!masterKey){
        return <PinModal/>
    }

    if(!collectionData){
        return <Loading data={DISPLAY.TEXT.COLLECTIONS} error={error}/>
    }
    
    if(!journalMetadata){
        return <Loading data={DISPLAY.TEXT.JOURNALS} error={error}/>
    }
    
    if(!noteMetadata){
        return <Loading data={DISPLAY.TEXT.NOTES} error={error}/>
    }
    
    if(!weeklySchedule){
        return <Loading data={DISPLAY.TEXT.WEEKLY_SCHEDULE} error={error}/>
    }
    
    if(!taskData){
        return <Loading data={DISPLAY.TEXT.TASKS} error={error}/>
    }

    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={refreshPage}/>
            <CircleIconButton icon={<BsCalendarWeek/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.MANAGE_SCHEDULE} ttPlacement="right" onClick={()=> {} }/>
            <CircleIconButton icon={<AddIcon/>} tooltip={DISPLAY.TOOLTIPS.ADD_EVENT} ttPlacement="right" onClick={()=> {} } actionType='primary' />
            <CircleIconButton icon={<AiOutlineFileAdd/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.ADD_NOTE} ttPlacement="right" onClick={()=> {} }/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <BsCalendarRange color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.PLANNER}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>

                <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

                {/* Collections Tab */}
                {selectedTab === 0 && 
                    <CollectionsTab collectionData={collectionData} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />
                }

                {/* Calendar Tab */}
                {selectedTab === 1 && <></>}

                {/* Notes Tab */}
                {selectedTab === 2 && <></>}

            </AppLayout>
            
            {/* Required popups */}

        </div>
    );
}
