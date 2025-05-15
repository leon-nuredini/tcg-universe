import { useState } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import Rating from "../components/Rating";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useGetProductDetailsQuery } from "../slices/productsApiSlice";
import { addToCart } from "../slices/cartSlice";

export const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { data, isLoading, error } = useGetProductDetailsQuery(productId);
  const addToCartHandler = () => {
    dispatch(addToCart({ ...data, qty }));
    navigate('/cart');
  }
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">error?.data?.message || error.error</Message>
      ) : (
        <>
          <Link className="btn btn-light my-3" to="/">
            {" "}
            Go Back{" "}
          </Link>
          <Row>
            <Col md={4}>
              <Image src={`/${data.image}`} alt={data.name} fluid />
            </Col>
            <Col md={5}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{data.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={data.rating}
                    text={`${data.reviewCount} reviews`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>Price: ${data.price}</ListGroup.Item>
                <ListGroup.Item>Description: {data.description}</ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>
                        <strong>${data.price}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {data.quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {data.quantity > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Quantity</Col>
                        <Col>
                          <Form.Control
                            as="select"
                            value={qty}
                            onChange={(e) =>
                              setQty(Number(e.target.value))
                            }
                          >
                            {[
                              ...Array(data.quantity)
                                .keys()
                                .map((x) => (
                                  <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                  </option>
                                )),
                            ]}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      className="btn-block"
                      type="button"
                      disabled={data.quantity === 0}
                      onClick={addToCartHandler}
                    >
                      Add to Cart
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};
