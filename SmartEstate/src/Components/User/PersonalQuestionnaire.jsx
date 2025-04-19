import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';

const PersonalQuestionnaire = () => {
  const [formData, setFormData] = useState({
    propertyType: '',
    budget: '',
    location: '',
    rooms: '',
    size: '',
    parking: false,
    elevator: false,
    balcony: false,
    garden: false,
    petsAllowed: false,
    accessibility: false,
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call when backend is ready
    console.log('Questionnaire submitted:', formData);
  };

  return (
    <Container className="my-5 text-end" dir="rtl" style={{ maxWidth: '800px' }}>
      <Card className="shadow">
        <Card.Header className="bg-primary text-white py-3">
          <h2 className="text-center mb-0">שאלון התאמה אישי</h2>
        </Card.Header>
        <Card.Body className="px-4 py-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">סוג הנכס המבוקש</Form.Label>
              <Form.Select name="propertyType" value={formData.propertyType} onChange={handleChange} required>
                <option value="">בחר סוג נכס</option>
                <option value="apartment">דירה</option>
                <option value="house">בית פרטי</option>
                <option value="penthouse">פנטהאוס</option>
                <option value="studio">סטודיו</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">תקציב (בשקלים)</Form.Label>
              <Form.Control
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="0"
                placeholder="הכנס תקציב"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">מיקום מועדף</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="הזן עיר או שכונה"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">מספר חדרים</Form.Label>
              <Form.Select name="rooms" value={formData.rooms} onChange={handleChange} required>
                <option value="">בחר מספר חדרים</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">גודל (במ"ר)</Form.Label>
              <Form.Control
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                min="0"
                placeholder="הכנס גודל במ״ר"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-3">דרישות נוספות</Form.Label>
              <div className="d-flex flex-wrap gap-4 justify-content-start">
                <Form.Check
                  type="checkbox"
                  label="חניה"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="ms-4"
                />
                <Form.Check
                  type="checkbox"
                  label="מעלית"
                  name="elevator"
                  checked={formData.elevator}
                  onChange={handleChange}
                  className="ms-4"
                />
                <Form.Check
                  type="checkbox"
                  label="מרפסת"
                  name="balcony"
                  checked={formData.balcony}
                  onChange={handleChange}
                  className="ms-4"
                />
                <Form.Check
                  type="checkbox"
                  label="גינה"
                  name="garden"
                  checked={formData.garden}
                  onChange={handleChange}
                  className="ms-4"
                />
                <Form.Check
                  type="checkbox"
                  label="מותר חיות מחמד"
                  name="petsAllowed"
                  checked={formData.petsAllowed}
                  onChange={handleChange}
                  className="ms-4"
                />
                <Form.Check
                  type="checkbox"
                  label="נגישות לנכים"
                  name="accessibility"
                  checked={formData.accessibility}
                  onChange={handleChange}
                  className="ms-4"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">הערות נוספות</Form.Label>
              <Form.Control
                as="textarea"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="הזן הערות נוספות או דרישות מיוחדות"
              />
            </Form.Group>

            <div className="text-center mt-4">
              <Button variant="primary" type="submit" size="lg" className="px-5">
                שמור העדפות
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PersonalQuestionnaire; 