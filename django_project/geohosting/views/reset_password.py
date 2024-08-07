from django.views.generic import TemplateView


class ResetPasswordView(TemplateView):
    template_name = 'reset_password.html'
