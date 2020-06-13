
# Inference

To run a video conference system, enter the code below.

In the `\video_conference_system` directory

```bash
npm start
```

Check the server at the address below.

```bash
main page: localhost:3000
roomName page: localhost:3000/roomName
conferenceRoom page: localhost:3000/conferenceRoom
```
# Speech to Text
## How to use
The Speech to Text file is consisted of a callable class that literally converts a video/audio file to a text file.
The class Speech_to_Text can be used as below.
```
s2t = Speech_to_Text('language')
s2t('/path/to/video/or/audio/file/to/convert', '/path/to/output/script/or/text/file')
```
The 'language' should be specified as either `'English'` or `'Korean'`.

## Details
This conversion only supports the following file foramts:
For video: ```.avi, .mov, .mp4, .ogv, .webm```
For audio: ```.mp3, .ogg, .wav, .flv, .raw```
