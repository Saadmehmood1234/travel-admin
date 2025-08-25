'use client';

import { useState, useEffect } from 'react';
import { createOffer, getOffers, updateOffer, deleteOffer, SerializedOffer } from '@/actions/offer.actions';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<SerializedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOffer, setEditingOffer] = useState<SerializedOffer | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const result = await getOffers();
      if (result.success && result.data) {
        setOffers(result.data);
      } else {
        setError(result.error || 'Failed to load offers');
      }
    } catch (err) {
      setError('An error occurred while loading offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (formData: FormData) => {
    try {
      const result = await createOffer(formData);
      if (result.success) {
        setShowForm(false);
        loadOffers();
      } else {
        setError(result.error || 'Failed to create offer');
      }
    } catch (err) {
      setError('An error occurred while creating the offer');
    }
  };

  const handleUpdateOffer = async (id: string, formData: FormData) => {
    try {
      const result = await updateOffer(id, formData);
      if (result.success) {
        setEditingOffer(null);
        loadOffers();
      } else {
        setError(result.error || 'Failed to update offer');
      }
    } catch (err) {
      setError('An error occurred while updating the offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        const result = await deleteOffer(id);
        if (result.success) {
          loadOffers();
        } else {
          setError(result.error || 'Failed to delete offer');
        }
      } catch (err) {
        setError('An error occurred while deleting the offer');
      }
    }
  };

  const handleEditClick = (offer: SerializedOffer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingOffer(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Offers</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Cancel' : 'Create New Offer'}
        </button>
      </div>
      
      {showForm && (
        <OfferForm
          offer={editingOffer}
          onSubmit={editingOffer ? 
            (formData) => handleUpdateOffer(editingOffer._id, formData) : 
            handleCreateOffer
          }
          onCancel={handleCancel}
        />
      )}
      
      <OffersTable 
        offers={offers} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteOffer} 
      />
    </div>
  );
}

interface OfferFormProps {
  offer?: SerializedOffer | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

function OfferForm({ offer, onSubmit, onCancel }: OfferFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">
        {offer ? 'Edit Offer' : 'Create New Offer'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={offer?.title || ''}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subtitle">
            Subtitle *
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            defaultValue={offer?.subtitle || ''}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
            Discount *
          </label>
          <input
            type="number"
            id="discount"
            name="discount"
            defaultValue={offer?.discount || ''}
            required
            min="0"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Type *
          </label>
          <select
            id="type"
            name="type"
            defaultValue={offer?.type || 'percentage'}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
            Code *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            defaultValue={offer?.code || ''}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="validUntil">
            Valid Until *
          </label>
          <input
            type="datetime-local"
            id="validUntil"
            name="validUntil"
            defaultValue={offer?.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : ''}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            Image URL *
          </label>
          <input
            type="url"
            id="image"
            name="image"
            defaultValue={offer?.image || ''}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
            Icon *
          </label>
          <select
            id="icon"
            name="icon"
            defaultValue={offer?.icon || 'Tag'}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="Clock">Clock</option>
            <option value="Percent">Percent</option>
            <option value="Gift">Gift</option>
            <option value="Zap">Zap</option>
            <option value="Star">Star</option>
            <option value="Heart">Heart</option>
            <option value="Tag">Tag</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
            Color *
          </label>
          <input
            type="text"
            id="color"
            name="color"
            defaultValue={offer?.color || ''}
            required
            placeholder="e.g., bg-gradient-to-r from-blue-500 to-purple-600"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4 md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={offer?.description || ''}
            required
            rows={3}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        {offer && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isActive">
              Status
            </label>
            <select
              id="isActive"
              name="isActive"
              defaultValue={offer.isActive ? 'true' : 'false'}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}
        
        <div className="flex items-center justify-end md:col-span-2 space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {offer ? 'Update Offer' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface OffersTableProps {
  offers: SerializedOffer[];
  onEdit: (offer: SerializedOffer) => void;
  onDelete: (id: string) => void;
}

function OffersTable({ offers, onEdit, onDelete }: OffersTableProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">No offers found. Create your first offer!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valid Until
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offers.map((offer) => (
            <tr key={offer._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={offer.image} alt={offer.title} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                    <div className="text-sm text-gray-500">{offer.subtitle}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-mono">{offer.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {offer.type === 'percentage' ? `${offer.discount}%` : `$${offer.discount}`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(offer.validUntil).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(offer)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(offer._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}