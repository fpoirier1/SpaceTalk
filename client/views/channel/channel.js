Channel = BlazeComponent.extendComponent({
  onCreated: function () {
    var self = this;
    // Listen for changes to reactive variables (such as FlowRouter.getParam()).
    self.autorun(function () {
      currentChannel() && self.subscribe('messages', currentChannelId(), function () {
        scrollDown();
      });
    });
  },
  onRendered: function () {
    // Observe the changes on the messages for this channel
    Messages.find({
      channelId: currentChannelId()
    }).observeChanges({
      // When a new message is added
      added: function (id, doc) {
        // Trigger the scroll down method which determines whether to scroll down or not
        scrollDown();
      }
    });

    $('article').css({
      'padding-bottom': $('footer').outerHeight()
    });
  },
  messages: function () {
    return Messages.find({
      channelId: currentChannelId()
    });
  },
  channel: function() {
    var _id = currentRouteId();
    return Channels.findOne({
      _id: _id
    });
  },
  user: function() {
    return Meteor.users.findOne({
      _id: this.currentData()._userId
    });
  },
  time: function() {
    return moment(this.timestamp).format('h:mm a');
  },
  date: function() {
    var dateNow = moment(this.currentData().timestamp).calendar();

    if (!this.date || this.date != dateNow) {
      return this.date = dateNow;
    }
  },
  avatar: function() {
    var user = Meteor.users.findOne(this.currentData().userId);
    if (user && user.emails) {
      return Gravatar.imageUrl(user.emails[0].address);
    }
  },
  events: function() {
    return [
      {
        'keydown .message-input': function (event) {
          if (event.keyCode == 13 && !event.shiftKey) { // Check if enter was pressed (but without shift).
            event.preventDefault();
            var _id = currentRouteId();
            var value = this.find('textarea').value;
            // Markdown requires double spaces at the end of the line to force line-breaks.
            value = value.replace("\n", "  \n");
            this.find('.message-input').value = ''; // Clear the textarea.
            Messages.insert({
              // TODO: should be checked server side if the user is allowed to do this
              channelId: currentChannelId(),
              message: value,
              // TODO: should be added server side.
              userId: Meteor.userId(), // Add userId to each message.
              // TODO: should be added automatically with simple-schema or astronomy, this is pretty bad
              timestamp: new Date() // Add a timestamp to each message.
            });
            // Restore the autosize value.
            this.$('.message-input').css({
              height: 37
            });
            window.scrollTo(0, document.body.scrollHeight);
          }
        }
      }];
  }
}).register('channel');

/**
 * Scrolls down the page when the user is a at or nearly at the bottom of the page
 */
var scrollDown = function () {
  // Check if the innerHeight + the scrollY position is higher than the offsetHeight - 200
  if ((
    window.innerHeight + window.scrollY
    ) >= (
    Number(document.body.offsetHeight) - 200
    )) {
    // Scroll down the page
    window.scrollTo(0, document.body.scrollHeight);
  }
}
