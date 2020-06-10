import os
import moviepy.editor as mp
import speech_recognition as sr
from pydub import AudioSegment
import shutil


class Speech_to_Text:
	def __init__(self, language, segment_length=5):
		self.recognizer = sr.Recognizer()

		# predefine the language mode.
		if language == 'English':
			self.mode = 'en-US'
		elif language == 'Korean':
			self.mode = 'ko'

		self.segment_length = segment_length
		self.last_idx = 0

	def __call__(self, file_path, output_file):
		self.file_path = file_path

		if not os.path.exists(self.file_path):
			raise FileNotFoundError('path to file does not exist.')

		# make sure the file to forward is an audio file.
		if self.isVideo(self.file_path):
			self.file_path = self.Video_to_Audio(self.file_path)
		elif not self.isAudio(self.file_path):
			raise TypeError('Cannot handle this file format. Must be video(.avi, .mov, .mp4, .ogv, .webm) or audio(.mp3, .ogg, .wav, .flv, .raw)')

		# fetch the audio file to convert
		self.audio = self.get_audio()
		self.duration = int(self.audio.duration_seconds)

		# break down the audio to pieces.
		self.segment_dir, list_path_segments = self.breakdown(self.segment_length)

		# convert each piece of audio
		text_segments = self.convert_all(list_path_segments)

		# connect each converted piece of text
		connected_text = self.connect(text_segments)

		# write the final script to output file
		write_script(connected_text, output_file)

		# remove temporary directory built
		shutil.rmtree(self.segment_dir)

	# break down an audio to segments. save them as each individual audio file, and keep record of the path
	def breakdown(self, segment_length):
		_ms = 1000
		file_name = get_filename(self.file_path)
		cur_dir = os.getcwd()
		tmp_dir = os.path.join(cur_dir, file_name)
		if not os.path.exists(tmp_dir):
			os.makedirs(tmp_dir)
		segments_path = []

		for start_sec in range(0, self.duration, segment_length):
			segment = self.audio[start_sec * _ms: (start_sec + segment_length) * _ms]
			link_segment = self.audio[(start_sec + segment_length / 2) * _ms: (start_sec + 3 * segment_length / 2) * _ms]

			cur_path = os.path.join(tmp_dir, str(start_sec) + '.wav')
			cur_link_path = os.path.join(tmp_dir, str(start_sec) + '_l.wav')

			segments_path.append(cur_path)
			segments_path.append(cur_link_path)
			segment.export(cur_path, format='wav')
			link_segment.export(cur_link_path, format='wav')

		return tmp_dir, segments_path

	# convert each segment of audio
	def convert(self, segment_file):
		with sr.AudioFile(segment_file) as source:
			audio_text = self.recognizer.listen(source)
			try:
				text = self.recognizer.recognize_google(audio_text, language=self.mode)
				# print(text)
				return text
			except:
				return None

	# connect the converted text segments
	def connect(self, segments):
		connected = []
		_n = len(segments)
		for i in range(_n):
			connected = self.add_line(connected, segments[i])

		connected = self.rearrange_text(connected)

		return connected

	# iterate and convert all audio segments
	def convert_all(self, _list_of_path):
		_n = len(_list_of_path)
		text = []
		print('converting...')
		for i in range(_n):
			phrase = self.convert(_list_of_path[i])
			if phrase is not None:
				text.append(phrase)

		return text

	# fetch audio from a file
	def get_audio(self):
		audio = None
		if self.format == 'mp3':
			audio = AudioSegment.from_mp3(self.file_path)
		elif self.format == 'ogg':
			audio = AudioSegment.from_ogg(self.file_path)
		elif self.format == 'wav':
			audio = AudioSegment.from_wav(self.file_path)
		elif self.format == 'flv':
			audio = AudioSegment.from_flv(self.file_path)
		elif self.format == 'raw':
			audio = AudioSegment.from_raw(self.file_path)

		return audio

	# check if the input is a video file
	def isVideo(self, filename):
		if filename.endswith(('.avi', '.mov', '.mp4', '.ogv', '.webm')): return True
		else: return False

	# check if the input is an audio file
	def isAudio(self, filename):
		if filename.endswith('.mp3'):
			self.format = 'mp3'
			return True

		elif filename.endswith('.ogg'):
			self.format = 'ogg'
			return True

		elif filename.endswith('.wav'):
			self.format = 'wav'
			return True

		elif filename.endswith('.flv'):
			self.format = 'flv'
			return True

		elif filename.endswith('.raw'):
			self.format = 'raw'
			return True

		else:
			return False

	# convert a video file to an audio file
	def Video_to_Audio(self, path_to_video, format='mp3'):
			file_name = get_filename(path_to_video)
			self.format = format
			path_to_audio = file_name + '.' + format
			video = mp.VideoFileClip(path_to_video)
			video.audio.write_audiofile(path_to_audio)

			return path_to_audio

	# add a line from converted segments. find overlapping parts and overwrite errors from conversion
	def add_line(self, current_text, segment):
		idx1, idx2, segment_words = self.find_overlap(current_text, segment)
		if idx1 is None and idx2 is None:
			arranged_line = current_text + ['.\n'] + segment_words
		else:
			arranged_line = current_text[:idx1] + segment_words[idx2:]

		return arranged_line

	# find overlapping parts of segments
	def find_overlap(self, current_text, new_line):
		new_words = new_line.split(' ')

		_n = len(new_words)
		idx1 = None
		idx2 = None
		for i in range(_n):
			try:
				idx1 = current_text.index(new_words[i], self.last_idx)
				self.last_idx = idx1 + 1
				idx2 = i
			except:
				continue

		return idx1, idx2, new_words

	# rearrange a list of words to a single script string.
	def rearrange_text(self, text):
		_n = len(text)
		arranged = ''
		for i in range(_n):
			arranged = arranged + text[i]
			if not text[i] == '.\n':
				arranged = arranged + ' '

		arranged = arranged[2:]  # remove dummy new line in the start

		return arranged


# write the output script file from a string text
def write_script(script, output_file):
	text_file = open(output_file, 'w')
	text_file.write(script)
	text_file.close()


# get the name of a file without its format
def get_filename(file_path):
	file_name = os.path.basename(file_path)
	file_name = file_name.split('.')[:-1]
	file_name = ''.join(file_name)

	return file_name


if __name__ == '__main__':
	stt = Speech_to_Text('English')
	# stt = Speech_to_Text('Korean')
	stt('How we teach computers to understand pictures - Fei Fei Li.mp4', 'tmp.txt')
	# stt('[날씨] 내일도 더위 이어져…오후부터 차차 전국 비 - KBS뉴스(News).mp4', 'weather.txt')
	# stt('SampleVideo_360x240.mp4')
	# stt('hello.wav')