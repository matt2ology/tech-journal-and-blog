---
aliases: Notes on Django 6 - Structure of a Django Application - User Input with Forms
title: Notes on Django 6 - Structure of a Django Application - User Input with Forms
date: 2026-11-13T13:23:17-08:00
draft: false
slug: django-6-structure-of-a-django-application-user-input-with-forms
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Structure of a Django Application
lesson: User Input with Forms
---

**Analysis:** [[../../../analysis/courses/django-6-the-big-picture/03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] User Input with Forms Summary
>
> When a model class is defined (i.e. a class in `models.py`) Django can auto generate forms with input fields; and, with a little bit of code in `views.py` we are able to create a ["ModelForm" class](https://docs.djangoproject.com/en/6.1/topics/forms/modelforms/#modelform), and code in the templates (in the the HTML)

## User Input with Forms

Forms are defined by a model class.

For example:

Comments are associated with a specific trip: `trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="comments")`

```python
# trips/models.py
class Comment(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="comments")
    name = models.CharField("Your name", max_length=100)
    text = models.TextField("Your comment")
    created_date = models.DateTimeField(default=timezone.now)
```

In the `view.py` file a form class based on the comment class.

A form class can be used to create user inputs on a web page and also validate that the input is correct.

The view function (e.g. `detail_page`), runs when a user visits the detail page for a trip

- The form is passed to the templates: `"comments_form": CommentForm()`

```python
# trips/views.py
CommentForm = modelform_factory(Comment, fields=["name", "text"])

def detail_page(request, pk: int):
    post = get_object_or_404(Trip, pk=pk)
    destinations = Destination.objects.values_list("country", flat=True).distinct()

    return render(
        request,
        "detail.html",
        {
        "post": post,
        "destinations": destinations,
        "comment_form": CommentForm(),
        }
    )
```

In the templates the form can be added `{{ comment_form | crispy }}`

- There are some other parts here like the crispy filter and the actual form tag, but most of that is boilerplate.

The form is rendered via `comment_form` and is based on the model class for comments `CommentForm = modelform_factory(Comment, fields=["name", "text"])` - and later in the render view function `"comment_form": CommentForm()`

```html
<!-- templates/detail.html -->
<div class="flex flex-col items-start pt-6">
  <h2 class="font-bold">Leave a comment</h2>
  <form class="p-6" action="{% url 'trip_comment' pk=post.id %}" method="post">
    {% csrf_token %} {{ comment_form | crispy }}
    <input type="submit" value="Submit" />
  </form>
</div>
```

A separate view function handles when a comment is entered and submitted.

- **`DATA=REQUEST.post`:** get the data entered from user
- **`if form.is_valid()`:** validate that it conforms to the form
  - Check all kinds of user input
- **`form.save()`:** Save the content to the database

```python
# trips/views.py
def comment(request, pk: int):
    trip = get_object_or_404(Trip, pk=pk)
    if request.method == "POST":
        form = CommentForm(data=request.POST, initial={"trip_id": trip.id})
    if form.is_valid():
        form.instance.trip = trip
        form.save()
return redirect("trip_detail", pk=pk)
```
