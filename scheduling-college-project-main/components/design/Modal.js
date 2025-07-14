import React, { useState } from 'react'
import { Button, Modal } from "flowbite-react";

const CustomModal = ({ showForm,
    setShowForm,
    visibleColumns,
    setVisibleColumns
}) => {

 


    return (
        <Modal dismissible show={showForm} onClose={() => setShowForm(false)}>
            <Modal.Header>Select columns to display</Modal.Header>
            <Modal.Body>
                
            </Modal.Body>
            <Modal.Footer>
                <Button color="success" type="submit"
                    onClick={() => {
                        setShowForm(false)
                    }} >
                    Save
                </Button>
                <Button color="danger"
                    onClick={() => setShowForm(false)}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default CustomModal