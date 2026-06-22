import React, { useState, useMemo } from "react";
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { Text, Flex, Grid, Box, Badge } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { EditIcon } from "@chakra-ui/icons";
import { RiShoppingBag4Line } from "react-icons/ri"; //shopping
import { MdOutlineFastfood } from "react-icons/md"; // food
import { MdOutlineOndemandVideo } from "react-icons/md"; // watchlist
import { GiWhiteBook } from "react-icons/gi"; // reading
import { TbCopyCheck } from "react-icons/tb"; // todo
import { MdTravelExplore } from "react-icons/md"; // trip
import { MdFavoriteBorder } from "react-icons/md"; // wishlist
import { LuNotepadText } from "react-icons/lu"; // notepad

import CircleIconButton from "../../common-components/form/CircleIconButton";
import ViewShoppingListPopup from "../../common-components/popup/ViewShoppingListPopup";
import EditShoppingListPopup from "../../common-components/popup/EditShoppingListPopup";
import ViewFoodListPopup from "../../common-components/popup/ViewFoodListPopup";
import EditFoodListPopup from "../../common-components/popup/EditFoodListPopup";
import EditWatchlistPopup from "../../common-components/popup/EditWatchlistPopup";
import ViewWatchlistPopup from "../../common-components/popup/ViewWatchlistPopup";
import EditReadingListPopup from "../../common-components/popup/EditReadingListPopup";
import ViewReadingListPopup from "../../common-components/popup/ViewReadingListPopup";
import EditWishlistPopup from "../../common-components/popup/EditWishlistPopup";
import ViewWishlistPopup from "../../common-components/popup/ViewWishlistPopup";
import EditTripListPopup from "../../common-components/popup/EditTripListPopup";
import ViewTripListPopup from "../../common-components/popup/ViewTripListPopup";
import ViewTodoListPopup from "../../common-components/popup/ViewTodoListPopup";
import EditTodoListPopup from "../../common-components/popup/EditTodoListPopup";
import ViewNotepadPopup from "../../common-components/popup/ViewNotepadPopup";
import EditNotepadPopup from "../../common-components/popup/EditNotepadPopup";


export default function CollectionsTab({collectionData, refreshCollections, setRefreshCollections}) {
    if(!collectionData) return null;

    const {DISPLAY} = useLanguage();
    const {
        disableShoppingListModifications, 
        disableFoodListModifications, 
        disableWatchlistModifications, 
        disableReadingListModifications, 
        disableWishlistModifications, 
        disableTodoListModifications, 
        disableTripListModifications, 
        disableNotepadModifications,
    } = useAppContext();

    /* View Popups */
    const [showViewShoppingListPopup, setShowViewShoppingListPopup] = useState(false);
    const [showViewFoodPopup, setShowViewFoodPopup] = useState(false);
    const [showViewWatchlistPopup, setShowViewWatchlistPopup] = useState(false);
    const [showViewReadingListPopup, setShowViewReadingListPopup] = useState(false);
    const [showViewWishlistPopup, setShowViewWishlistPopup] = useState(false);
    const [showViewTodoListPopup, setShowViewTodoListPopup] = useState(false);
    const [showViewTripListPopup, setShowViewTripListPopup] = useState(false);
    const [showViewNotepadPopup, setShowViewNotepadPopup] = useState(false);

    /* Edit Popups */
    const [showEditShoppingListPopup, setShowEditShoppingListPopup] = useState(false);
    const [showEditFoodPopup, setShowEditFoodPopup] = useState(false);
    const [showEditWatchlistPopup, setShowEditWatchlistPopup] = useState(false);
    const [showEditReadingListPopup, setShowEditReadingListPopup] = useState(false);
    const [showEditWishlistPopup, setShowEditWishlistPopup] = useState(false);
    const [showEditTodoListPopup, setShowEditTodoListPopup] = useState(false);
    const [showEditTripListPopup, setShowEditTripListPopup] = useState(false);
    const [showEditNotepadPopup, setShowEditNotepadPopup] = useState(false);

    const shoppingList = useMemo(
        () => collectionData.find(val => val.type === 'SHOPPING')?.collectionData || [], 
        [collectionData]
    );

    const foodList = useMemo(
        () => collectionData.find(val => val.type === 'FOOD')?.collectionData || [], 
        [collectionData]
    );

    const watchlist = useMemo(
        () => collectionData.find(val => val.type === 'WATCHLIST')?.collectionData || [], 
        [collectionData]
    );

    const readingList = useMemo(
        () => collectionData.find(val => val.type === 'READING')?.collectionData || [], 
        [collectionData]
    );

    const wishlist = useMemo(
        () => collectionData.find(val => val.type === 'WISHLIST')?.collectionData || [], 
        [collectionData]
    );

    const todoList = useMemo(
        () => collectionData.find(val => val.type === 'TODO')?.collectionData || [], 
        [collectionData]
    );

    const tripList = useMemo(
        () => collectionData.find(val => val.type === 'TRIP')?.collectionData || [], 
        [collectionData]
    );
    
    const notepad = useMemo(
        () => collectionData.find(val => val.type === 'NOTEPAD')?.collectionData || {}, 
        [collectionData]
    );

    const COLLECTION_CONFIG = {
        SHOPPING: {
            Icon: RiShoppingBag4Line,
            color: '#22C55E'
        },
        FOOD: {
            Icon: MdOutlineFastfood,
            color: '#F97316'
        },
        WATCHLIST: {
            Icon: MdOutlineOndemandVideo,
            color: '#8B5CF6'
        },
        READING: {
            Icon: GiWhiteBook,
            color: '#3B82F6'
        },
        TODO: {
            Icon: TbCopyCheck,
            color: '#14B8A6'
        },
        TRIP: {
            Icon: MdTravelExplore,
            color: '#06B6D4'
        },
        WISHLIST: {
            Icon: MdFavoriteBorder,
            color: '#EC4899'
        },
        NOTEPAD: {
            Icon: LuNotepadText,
            color: '#64748B'
        }
    };

    const handleViewCollectionClick = type =>{
        switch(type){
            case 'SHOPPING':
                setShowViewShoppingListPopup(true);
                break;
    
            case 'FOOD':
                setShowViewFoodPopup(true);
                break;
    
            case 'WATCHLIST':
                setShowViewWatchlistPopup(true);
                break;
    
            case 'READING':
                setShowViewReadingListPopup(true);
                break;
    
            case 'WISHLIST':
                setShowViewWishlistPopup(true);
                break;
    
            case 'TODO':
                setShowViewTodoListPopup(true);
                break;
    
            case 'TRIP':
                setShowViewTripListPopup(true);
                break;
    
            case 'NOTEPAD':
                setShowViewNotepadPopup(true);
                break;
        }
    }

    const handleEditCollectionClick = type =>{
        switch(type){
            case 'SHOPPING':
                setShowEditShoppingListPopup(true);
                break;
    
            case 'FOOD':
                setShowEditFoodPopup(true);
                break;
    
            case 'WATCHLIST':
                setShowEditWatchlistPopup(true);
                break;
    
            case 'READING':
                setShowEditReadingListPopup(true);
                break;
    
            case 'WISHLIST':
                setShowEditWishlistPopup(true);
                break;
    
            case 'TODO':
                setShowEditTodoListPopup(true);
                break;
    
            case 'TRIP':
                setShowEditTripListPopup(true);
                break;
    
            case 'NOTEPAD':
                setShowEditNotepadPopup(true);
                break;
        }
    }

    const getDisableModificationSettings = (type) =>{
        switch(type){
            case 'SHOPPING': return disableShoppingListModifications;
            case 'FOOD': return disableFoodListModifications;
            case 'WATCHLIST': return disableWatchlistModifications;
            case 'READING': return disableReadingListModifications;
            case 'WISHLIST': return disableWishlistModifications;
            case 'TODO': return disableTodoListModifications;
            case 'TRIP': return disableTripListModifications;
            case 'NOTEPAD': return disableNotepadModifications;
        }
    }


    const CollectionCard = ({collection}) =>{
        const config = COLLECTION_CONFIG[collection.type];
        const Icon = config.Icon;
    
        return (
            <Flex align='center' justify='space-between' padding={theme.paddingL} backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} cursor='pointer' onClick={()=> handleViewCollectionClick(collection.type)} _hover={{backgroundColor: theme.hoverBg}}>
                <Flex align='center' gap={theme.paddingL}>
                    <Flex align='center' justify='center' width='52px' height='52px' borderRadius='10px' backgroundColor={`${config.color}20`}>
                        <Icon size='24px' color={config.color}/>
                    </Flex>
    
                    <Flex direction='column'>
                        <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                            {DISPLAY.TEXT[collection.type]}
                        </Text>
    
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {collection.type === 'NOTEPAD'
                                ? DISPLAY.TEXT.QUICK_NOTES
                                : `${collection.collectionData.length} ${DISPLAY.TEXT.ITEMS}`
                            }
                        </Text>
                    </Flex>
                </Flex>
                
                {!getDisableModificationSettings(collection.type) && 
                    <CircleIconButton icon={<EditIcon/>} tooltip={DISPLAY.TOOLTIPS.EDIT} onClick={(e)=> {e.stopPropagation(); handleEditCollectionClick(collection.type); }} />
                }
            </Flex>
        );
    }

    
    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg: '1fr 1fr 1fr'}} gap={theme.paddingL} marginTop={theme.spacing} alignItems='start'>
                {collectionData.map(collection =>
                    <CollectionCard key={collection.type} collection={collection} />
                )}
                <div style={{height: '140px'}}></div>
            </Grid>

            {/* View Shopping List Popup */}
            <ViewShoppingListPopup isOpen={showViewShoppingListPopup} onClose={setShowViewShoppingListPopup} shoppingList={shoppingList} />

            {/* Edit Shopping List Popup */}
            <EditShoppingListPopup isOpen={showEditShoppingListPopup} onClose={setShowEditShoppingListPopup} shoppingList={shoppingList} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Food List Popup */}
            <ViewFoodListPopup isOpen={showViewFoodPopup} onClose={setShowViewFoodPopup} foodList={foodList} />

            {/* Edit Food List Popup */}
            <EditFoodListPopup isOpen={showEditFoodPopup} onClose={setShowEditFoodPopup} foodList={foodList} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Watchlist Popup */}
            <ViewWatchlistPopup isOpen={showViewWatchlistPopup} onClose={setShowViewWatchlistPopup} watchlist={watchlist} />

            {/* Edit Watchlist Popup */}
            <EditWatchlistPopup isOpen={showEditWatchlistPopup} onClose={setShowEditWatchlistPopup} watchlist={watchlist} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Reading List Popup */}
            <ViewReadingListPopup isOpen={showViewReadingListPopup} onClose={setShowViewReadingListPopup} readingList={readingList} />

            {/* Edit Reading List Popup */}
            <EditReadingListPopup isOpen={showEditReadingListPopup} onClose={setShowEditReadingListPopup} readingList={readingList} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Wishlist Popup */}
            <ViewWishlistPopup isOpen={showViewWishlistPopup} onClose={setShowViewWishlistPopup} wishlist={wishlist} />

            {/* Edit Wishlist Popup */}
            <EditWishlistPopup isOpen={showEditWishlistPopup} onClose={setShowEditWishlistPopup} wishlist={wishlist} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Todo List Popup */}
            <ViewTodoListPopup isOpen={showViewTodoListPopup} onClose={setShowViewTodoListPopup} todoList={todoList} />

            {/* Edit Todo List Popup */}
            <EditTodoListPopup isOpen={showEditTodoListPopup} onClose={setShowEditTodoListPopup} todoList={todoList} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Trip List Popup */}
            <ViewTripListPopup isOpen={showViewTripListPopup} onClose={setShowViewTripListPopup} tripList={tripList} />

            {/* Edit Trip List Popup */}
            <EditTripListPopup isOpen={showEditTripListPopup} onClose={setShowEditTripListPopup} tripList={tripList} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />

            {/* View Notepad Popup */}
            <ViewNotepadPopup isOpen={showViewNotepadPopup} onClose={setShowViewNotepadPopup} notepad={notepad} />

            {/* Edit Notepad Popup */}
            <EditNotepadPopup isOpen={showEditNotepadPopup} onClose={setShowEditNotepadPopup} notepad={notepad} refreshCollections={refreshCollections} setRefreshCollections={setRefreshCollections} />
        </>
    );
}
