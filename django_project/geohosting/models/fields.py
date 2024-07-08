import os

from PIL.Image import Image
from django.db.models import ImageField

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class SVGAndImageValidator:
    error_message = 'Unsupported file extension or corrupt image file.'

    def __call__(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        if ext == '.svg':
            if not value.file.read().startswith(b'<svg'):
                raise ValidationError(self.error_message)
        else:
            try:
                value.file.seek(0)
                img = Image.open(value.file)
                img.verify()
            except (IOError, SyntaxError):
                raise ValidationError(self.error_message)


class SVGAndImageField(ImageField):
    default_validators = [SVGAndImageValidator()]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        from django.forms import FileField as FormFileField

        defaults = {'form_class': FormFileField}
        defaults.update(kwargs)
        return super().formfield(**defaults)

#
# class SVGAndImageFormField(FormImageField):
#     def __init__(self, *args, **kwargs):
#         kwargs.setdefault('validators', []).append(validate_svg)
#         super().__init__(*args, **kwargs)
#
#     def to_python(self, data):
#         file = super().to_python(data)
#         if hasattr(file, 'content_type'):
#             if file.content_type == 'image/svg+xml':
#                 return file
#         return super().to_python(data)
#
# #
# # class SVGAndImageField(ImageField):
# #     attr_class = SVGAndImageFieldFile
# #
# #     def formfield(self, **kwargs):
# #         defaults = {'form_class': SVGAndImageFormField}
# #         defaults.update(kwargs)
# #         return super().formfield(**defaults)
