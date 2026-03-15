<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Order; // <-- ADDED: Import the Order model

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    // ADDED: Public properties to hold the order data and admin flag
    public $order;
    public $isAdminNotification;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, $isAdminNotification = false) // <-- UPDATED
    {
        $this->order = $order;
        $this->isAdminNotification = $isAdminNotification;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope // <-- Updated method signature
    {
        // ADDED: Dynamic subject line based on the recipient
        $subject = $this->isAdminNotification 
            ? 'NEW ORDER RECEIVED: #' . $this->order->order_id 
            : 'Your Order #' . $this->order->order_id . ' Confirmation';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content // <-- Updated method signature
    {
        return new Content(
            // UPDATED: Set the correct view file
            view: 'emails.order-confirmation', 
            // ADDED: Pass the public properties to the email template
            with: [
                'order' => $this->order,
                'isAdmin' => $this->isAdminNotification,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments()
    {
        return [];
    }
}