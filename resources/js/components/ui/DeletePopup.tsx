import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon } from 'lucide-react';

interface DeletePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    title?: string;
    itemName?: string;
    description?: string;
    processing?: boolean;
    icon?: ReactNode;
}

const DeletePopup = ({
    isOpen,
    onClose,
    onDelete,
    title = "Delete Item",
    itemName = "",
    description = "Are you sure you want to delete this item? This action cannot be undone.",
    processing = false,
    icon = <TrashIcon className="w-6 h-6 text-destructive" aria-hidden="true" />
}: DeletePopupProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    className="relative w-full max-w-md p-6 mx-auto rounded-lg shadow-xl bg-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="sm:flex sm:items-start">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-destructive/10">
                            {icon}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg font-medium text-foreground">{title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">
                                    {itemName && description.includes("{itemName}") ? (
                                        <>
                                            {description.split("{itemName}").map((part, index, array) => (
                                                index === array.length - 1 ? (
                                                    <span key={index}>{part}</span>
                                                ) : (
                                                    <span key={index}>
                                                        {part}
                                                        <span className="font-semibold text-foreground">{itemName}</span>
                                                    </span>
                                                )
                                            ))}
                                        </>
                                    ) : (
                                        description
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onDelete}
                            disabled={processing}
                        >
                            {processing ? 'Deleting...' : 'Delete'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium border rounded-md shadow-sm text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm border-border"
                            onClick={onClose}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DeletePopup;