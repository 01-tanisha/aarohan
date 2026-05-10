from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    """
    Custom exception handler to ensure all API errors return JSON
    instead of HTML error pages.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # REST framework handled this exception
        return response

    # If we get here, it's an unhandled exception
    # Return a JSON response instead of letting Django return HTML
    return Response(
        {
            "error": "An error occurred",
            "details": str(exc),
            "type": type(exc).__name__
        },
        status=500
    )
