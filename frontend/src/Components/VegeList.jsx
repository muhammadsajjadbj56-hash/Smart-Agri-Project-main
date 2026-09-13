import React from 'react';
import { Table, Dropdown, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';
function VegeList() {
    const [data, setData] = useState([]);
    const [stateInfo, setStateInfo] = useState('telangana');

    function handleClick(e) {
        console.log("hello:" + e.target.value);
        setStateInfo(e.target.value);
    }
    useEffect(() => {
        axios.post(`${API_BASE}/get-item`, { stateInfo }).then((res) => {
            setData(res.data.filter((data) => data.vegetable_names !== ''));
            console.log(res.data);
        })
    }, [stateInfo, API_BASE])
    return (
        <section className="market-page">
            <div className="market-shell">
                <h1 className="section-title">Vegetable Market Rates</h1>
                <p className="section-subtitle">Track wholesale and retail prices across states.</p>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
                            Select State
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item><Button onClick={handleClick} value="andhraPradesh" variant='light'>Andhra Pradesh</Button></Dropdown.Item>
                            <Dropdown.Item><Button onClick={handleClick} value="arunachalPradesh" variant='light'>Arunachal Pradesh</Button></Dropdown.Item>
                            <Dropdown.Item><Button onClick={handleClick} value="telangana" variant='light'>Telangana</Button></Dropdown.Item>
                            <Dropdown.Item><Button onClick={handleClick} value="maharashtra" variant='light'>Maharashtra</Button></Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control type='text' value={stateInfo} style={{ width: 240, fontWeight: 'bold' }} readOnly />
                </div>

                <div className="table-shell">
                    <Table striped bordered hover variant='light' className="mb-0">
                        <thead>
                            <tr>
                                <th>Vegetable Names</th>
                                <th>Wholesale Price</th>
                                <th>Retail Price</th>
                                <th>Shopping Mall Price</th>
                                <th>Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={`${item.vegetable_names}-${index}`}>
                                    <td>{item.vegetable_names}</td>
                                    <td>{item.wholesale_price}</td>
                                    <td>{item.retail_price}</td>
                                    <td>{item.shoppingmall_price}</td>
                                    <td>{item.units}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </section>
    )
}
export default VegeList;