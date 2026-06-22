import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { createHash, createPassKey, decryptData, encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon, AddIcon, LockIcon, EditIcon, CloseIcon } from '@chakra-ui/icons';
import { MdRefresh, MdOutlineNewLabel, MdOutlineSettingsBackupRestore } from "react-icons/md";
import { IoExtensionPuzzleOutline } from "react-icons/io5";
import { FaInfo } from "react-icons/fa";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Loading from "../../common-components/Loading";
import PinModal from "../../common-components/PinModal";
import TabGroup from "../../common-components/navbar/TabGroup";
import Dropdown from "../../common-components/form/Dropdown";
import PasswordCard from "../../common-components/vault/PasswordCard";
import AddEditPasswordPopup from "../../common-components/popup/AddEditPasswordPopup";


export default function PasswordVault() {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey, hideRemovedLabels, hideShowPasswordButton, disablePasswordModifications} = useAppContext();
    const navigate = useNavigate();

    const [data, setData] = useState(null); //passwords data
    const [labels, setLabels] = useState(null);
    const [error, setError] = useState(null);

    const [selectedLabelIndex, setSelectedLabelIndex] = useState(0); // use for fetching passwords under the label
    const [searchQuery, setSearchQuery] = useState(''); // for searching passwords

    const [refreshPasswords, setRefreshPasswords] = useState(false); // refresh passwords
    const [refreshLabels, setRefreshLabels] = useState(false); // refresh labels
    const [isLoading, setIsLoading] = useState(false); // use this to disable buttons not to show <Loading/>

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.PASSWORD, DISPLAY.LABELS.LABELS];

    const [passwordToBeUpdated, setPasswordToBeUpdated] = useState(null);
    const [passwordIdToRemove, setPasswordIdToRemove] = useState(null);

    const [showAddPasswordPopup, setShowAddPasswordPopup] = useState(false);
    const [showEditPasswordPopup, setShowEditPasswordPopup] = useState(false);
    const [showDeletePasswordPopup, setShowDeletePasswordPopup] = useState(false);

    const [labelName, setLabelName] = useState(''); // use the same for renaming label
    const [labelIndexForAction, setLabelIndexForAction] = useState(0); // use for renaming, removing and recovering label

    const [showCreateLabelPopup, setShowCreateLabelPopup] = useState(false);
    const [showRenameLabelPopup, setShowRenameLabelPopup] = useState(false);
    const [showRemoveLabelPopup, setShowRemoveLabelPopup] = useState(false);
    const [showRecoverLabelPopup, setShowRecoverLabelPopup] = useState(false);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    const filteredData = useMemo(() => {
        if(!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(item =>
            item?.platform?.toLowerCase().includes(q)
        );
    }, [data, searchQuery, refreshPasswords]);

    // for fetching labels
    useEffect(()=> {
        if(!masterKey) return;
        async function fetchLabels(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/pm/labels',
                setIsLoading,
                onSuccess: async(res) =>{
                    const labelList = JSON.parse(await decryptData(res?.data?.userLabels?.labelList, res?.data?.userLabels?.labelNonce, masterKey));
                    setLabels(labelList);
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchLabels();
    }, [refreshLabels, masterKey]);

    // for fetching passwords
    useEffect(()=> {
        if(!masterKey) return;
        async function fetchPasswords(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/pm/passwords/${selectedLabelIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const passwordList = [];
                    for(const val of res?.data?.dataArray){
                        const decryptedData = JSON.parse(await decryptData(val.passwordData, val.nonce, masterKey));
                        decryptedData.id = val._id;
                        decryptedData.labelIndex = val.labelIndex;
                        passwordList.push(decryptedData);
                    }
                    setData(passwordList);
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchPasswords();
    }, [refreshPasswords, masterKey, selectedLabelIndex]);

    const deletePassword = async() =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/pm/passwords/${passwordIdToRemove}`,
            toastId,
            setIsLoading,
            onSuccess: (res)=>{
                setRefreshPasswords(!refreshPasswords);
                setShowDeletePasswordPopup(false);
            }
        });
    }

    const wrapperForUpdateLabels = async({e, action, setShowPopup}) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.PASSWORD_MANAGER.UPDATING_LABELS
        });
        if(!toastId) return;
        try{
            const {labelList, labelNonce} = await action();
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pm/labels',
                data: {labelList, labelNonce},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshLabels(!refreshLabels);
                    setLabelName('');
                    setShowPopup(false);
                },
                onError: (err) =>{
                    setShowPopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
            setShowPopup(false);
        }
    }

    const createLabel = async(e) =>{
        if(labelName.startsWith("*~Rem*") || labelName.trim().toLowerCase() === "default_other"){
            toast.error(TOASTS.PASSWORD_MANAGER.CANNOT_CREATE_LABEL);
            return;
        }
        await wrapperForUpdateLabels({
            e,
            action: async() =>{
                const updatedLabels = [...labels, labelName];
                const {encryptedData: labelList, nonce: labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);
                return {labelList, labelNonce};
            },
            setShowPopup: setShowCreateLabelPopup
        });
    }

    const renameLabel = async(e) =>{
        if(labelName.startsWith('*~Rem*') || labelName.trim().toLowerCase() === "default_other"){
            toast.error(TOASTS.PASSWORD_MANAGER.CANNOT_CREATE_LABEL);
            return;
        }
        if(labels.some(label => label === labelName)){
            toast.error(TOASTS.PASSWORD_MANAGER.LABEL_ALREADY_EXISTS);
            return;
        }
        await wrapperForUpdateLabels({ 
            e,
            action: async() =>{
                const updatedLabels = [...labels];
                updatedLabels[labelIndexForAction] = labelName;
                const {encryptedData:labelList, nonce:labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);
                return {labelList, labelNonce};
            },
            setShowPopup: setShowRenameLabelPopup
        });
    }

    const removeLabel = async(e) =>{
        if(labelIndexForAction === 0) return;
        await wrapperForUpdateLabels({
            action: async() =>{
                const updatedLabels = [...labels];
                updatedLabels[labelIndexForAction] = `*~Rem*${updatedLabels[labelIndexForAction]}`;
                const {encryptedData: labelList, nonce: labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);
                return {labelList, labelNonce};
            },
            setShowPopup: setShowRemoveLabelPopup
        });
    }

    const recoverLabel = async(e) =>{
        if(labelIndexForAction === 0) return;
        await wrapperForUpdateLabels({
            action: async() =>{
                const updatedLabels = [...labels];
                updatedLabels[labelIndexForAction] = updatedLabels[labelIndexForAction].replace('*~Rem*', '');
                const {encryptedData:labelList, nonce:labelNonce} = await encryptData(JSON.stringify(updatedLabels), masterKey);
                return {labelList, labelNonce};
            },
            setShowPopup: setShowRecoverLabelPopup
        });
    }

    const refreshPage = () =>{
        setRefreshPasswords(!refreshPasswords);
        setRefreshLabels(!refreshLabels);
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!labels){
        return <Loading data={DISPLAY.TEXT.USER_LABELS} error={error}/>
    }

    if(!data){
        return <Loading data={DISPLAY.TEXT.USER_PASSWORDS} error={error}/>
    }

    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={refreshPage}/>
            <CircleIconButton icon={<MdOutlineNewLabel/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.CREATE_LABEL} ttPlacement="right" onClick={()=> setShowCreateLabelPopup(true)}/>
            <CircleIconButton icon={<AddIcon/>} tooltip={DISPLAY.TOOLTIPS.ADD_PASSWORD} ttPlacement="right" onClick={()=> setShowAddPasswordPopup(true)} actionType='primary' />
            <CircleIconButton icon={<IoExtensionPuzzleOutline/>} tooltip={DISPLAY.TOOLTIPS.DOWNLOAD_EXTENSION} ttPlacement="right" onClick={()=>{}}/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <LockIcon color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.PASSWORD_MANAGER}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>
                
                {/* Search bar and Label Drodpwon */}
                {selectedTab === 0 && 
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr 2fr'}} gap={theme.paddingL} marginTop={theme.spacing} marginBottom={theme.marginL}>
                        <div style={{marginTop:'-10px', marginBottom: '-10px'}}>
                            <Dropdown value={selectedLabelIndex} onChange={(e)=> setSelectedLabelIndex(Number(e.target.value))}
                                options={
                                    labels.map((label, index)=>{
                                        if(label.startsWith('*~Rem*')){
                                            return null;
                                        }
                                        return {
                                            label: DISPLAY.PASSWORD_LABELS[label] || label,
                                            value: index
                                        };
                                    }).filter(Boolean)
                                }
                            />
                        </div>
                        <div style={{marginTop:'-10px', marginBottom: '-10px'}}>
                            <InputBox type='text' placeholder={`🔎︎ ${DISPLAY.LABELS.SEARCH_PASSWORD}`} name='searchQuery' value={searchQuery} onChange={(e)=> setSearchQuery(e.target.value)}/>
                        </div>
                    </Grid>
                }

                {(selectedTab === 0 && filteredData?.length === 0) &&
                    <div style={{width: '100%', display: 'flex', marginTop: theme.spacing, justifyContent: 'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>{DISPLAY.TEXT.NO_DATA}</Text>
                    </div>
                }

                {/* Main Content for Password */}
                {selectedTab === 0 && 
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg: '1fr 1fr 1fr'}} marginTop={`calc(${theme.marginL} * 2)`} width='100%' gap={theme.paddingL}>
                        {filteredData.map((item, index)=>
                            <div key={index}>
                                <PasswordCard labels={labels}
                                    item={item}
                                    hideShowPasswordButton={hideShowPasswordButton}
                                    disablePasswordModifications={disablePasswordModifications}
                                    setPasswordToBeUpdated={setPasswordToBeUpdated}
                                    setPasswordIdToRemove={setPasswordIdToRemove}
                                    setShowUpdatePasswordPopup={setShowEditPasswordPopup}
                                    setShowDeletePasswordPopup={setShowDeletePasswordPopup}
                                />
                            </div>
                        )}
                    </Grid>
                }

                {/* Main Content for Labels */}
                {selectedTab === 1 && <>
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg: '1fr 1fr 1fr'}} marginTop={`calc(${theme.marginL} * 2)`} width='100%' gap={theme.paddingL}>
                        {
                            labels.map((label, index)=>{
                                if(label.startsWith('*~Rem*')) return null;
                                return (
                                    <div key={index}>
                                        <Flex height='55.23px' backgroundColor={theme.cardBg} justify='space-between' align='center' border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding='7px' paddingLeft={theme.paddingL}>
                                            <Text color={theme.text} fontSize={theme.textSize}>
                                                {DISPLAY.PASSWORD_LABELS[label] || label}
                                            </Text>
                                            {index !== 0 && 
                                                <Flex gap={theme.marginS}>
                                                    <CircleIconButton icon={<EditIcon />} iconSize="15px" actionType='primary' tooltip={DISPLAY.TOOLTIPS.EDIT} onClick={()=>{ setLabelIndexForAction(index); setLabelName(label); setShowRenameLabelPopup(true) }}/>
                                                    <CircleIconButton icon={<CloseIcon />} iconSize="14px" tooltip={DISPLAY.TOOLTIPS.REMOVE} onClick={()=> {setLabelIndexForAction(index); setShowRemoveLabelPopup(true);}}/>
                                                </Flex>
                                            }
                                        </Flex>
                                    </div>
                                );
                            })
                        }
                    </Grid>
                    
                    {!hideRemovedLabels && <>
                        <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} width='auto'/>
                        <Text marginTop={theme.marginL} fontSize={theme.text} color={theme.text}>{DISPLAY.TEXT.REMOVED_LABELS}</Text>
                        {labels.some(label => label.startsWith('*~Rem*')) === false && 
                            <div style={{width: '100%', display: 'flex', marginTop: theme.spacing, justifyContent: 'center'}}>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}> {DISPLAY.TEXT.NO_DATA} </Text>
                            </div>
                        }

                        <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg: '1fr 1fr 1fr'}} marginTop={`calc(${theme.marginL} * 2)`} width='100%' gap={theme.paddingL}>
                            {labels.map((label, index)=>{
                                if(!label.startsWith('*~Rem*')) return null;
                                return (
                                    <div key={index}>
                                        <Flex height='55.23px' backgroundColor={theme.cardBg} justify='space-between' align='center' border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding='7px' paddingLeft={theme.paddingL}>
                                            <Text color={theme.text} fontSize={theme.textSize}>
                                                {label.replace("*~Rem*", '')}
                                            </Text>

                                            <CircleIconButton icon={<MdOutlineSettingsBackupRestore />} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.RECOVER} onClick={()=> {setLabelIndexForAction(index); setShowRecoverLabelPopup(true); }}/>
                                        </Flex>
                                    </div>
                                )}
                            )}
                        </Grid>
                    </>}
                </>}
            </AppLayout>

            {/* Add new password popup */}
            <AddEditPasswordPopup isOpen={showAddPasswordPopup} onClose={()=> setShowAddPasswordPopup(false)} labels={labels} refresh={refreshPasswords} setRefresh={setRefreshPasswords} />

            {/* Update password popup */}
            <AddEditPasswordPopup isOpen={showEditPasswordPopup} onClose={()=> setShowEditPasswordPopup(false)} editFlow={true} labels={labels} passwordData={passwordToBeUpdated} refresh={refreshPasswords} setRefresh={setRefreshPasswords} />
            
            {/* Delete password popup */}
            <Popup isOpen={showDeletePasswordPopup} onClose={()=> setShowDeletePasswordPopup(false)} title={DISPLAY.TEXT.DELETE_PASSWORD} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_PASSWORD}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeletePasswordPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deletePassword} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Create Label popup */}
            <Popup isOpen={showCreateLabelPopup} onClose={()=> setShowCreateLabelPopup(false)} title={DISPLAY.TEXT.CREATE_LABEL} borderColor={theme.success} bg={theme.bg}>
                <form>
                    <InputBox type='text' label={DISPLAY.LABELS.LABEL_NAME} name='labelName' value={labelName} onChange={(e)=> setLabelName(e.target.value)} required={true}/>
                    <ActionButton name={DISPLAY.BUTTONS.CREATE} isLoading={isLoading} disabled={isLoading} onClick={createLabel} actionType='primary' customStyle={{marginBottom: theme.marginL}} />
                </form>
            </Popup>
            
            {/* Rename Label popup */}
            <Popup isOpen={showRenameLabelPopup} onClose={()=> setShowRenameLabelPopup(false)} title={DISPLAY.TEXT.RENAME_LABEL} borderColor={theme.success} bg={theme.bg}>
                <form>
                    <InputBox type='text' label={DISPLAY.LABELS.LABEL_NAME} name='labelName' value={labelName} onChange={(e)=> setLabelName(e.target.value)} required={true}/>
                    <ActionButton name={DISPLAY.BUTTONS.RENAME} isLoading={isLoading} disabled={isLoading} onClick={renameLabel} actionType='primary' customStyle={{marginBottom: theme.marginL}} />
                </form>
            </Popup>

            {/* Remove Label popup */}
            <Popup isOpen={showRemoveLabelPopup} onClose={()=> setShowRemoveLabelPopup(false)} title={DISPLAY.TEXT.REMOVE_LABEL} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_REMOVE}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowRemoveLabelPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.REMOVE} onClick={removeLabel} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Recover Label popup */}
            <Popup isOpen={showRecoverLabelPopup} onClose={()=> setShowRecoverLabelPopup(false)} title={DISPLAY.TEXT.RECOVER_LABEL} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_RECOVER}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowRecoverLabelPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.RECOVER} onClick={recoverLabel} actionType='primary' />
                </ButtonGroup>
            </Popup>
        </div>
    );
}
