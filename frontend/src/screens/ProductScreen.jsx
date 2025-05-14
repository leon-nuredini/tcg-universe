import React from "react";
import { useParams } from 'react-router-dom'
import { Link } from "react-router-dom";
import { Row, Col, Image, ListGroup, Card, Button } from "react-bootstrap";
import Rating from "../components/Rating";
import { useGetProductDetailsQuery } from "../slices/productsApiSlice";

export const ProductScreen = () => {
  const { id:productId } = useParams();
  const { data, isLoading, error } = useGetProductDetailsQuery(productId);

  return (
    <>
      {isLoading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <div>error?.data?.message || error.error</div>
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
                <ListGroup.Item>
                  Description: {data.description}
                </ListGroup.Item>
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
                  <ListGroup.Item>
                    <Button
                      className="btn-block"
                      type="button"
                      disabled={data.quantity === 0}
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
