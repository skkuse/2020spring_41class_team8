import os
import moviepy.editor as mp
import speech_recognition as sr
from pydub import AudioSegment
from glob import glob
import shutil


class Speech_to_Text:
	def __init__(self, segment_length=5):
		self.recognizer = sr.Recognizer()
		self.segment_length = segment_length

	def __call__(self, file_path, output_file):
		self.file_path = file_path

		if not os.path.exists(self.file_path):
			raise FileNotFoundError('path to file does not exist.')

		# convert to audio file
		if self.isVideo(self.file_path):
			self.file_path = self.Video_to_Audio(self.file_path)
		elif not self.isAudio(self.file_path):
			raise TypeError('Cannot handle this file format. Must be video(.avi, .mov, .mp4, .ogv, .webm) or audio(.mp3, .ogg, .wav, .flv, .raw)')

		self.audio = self.get_audio()
		self.duration = int(self.audio.duration_seconds)

		self.segment_dir, list_path_segments = self.breakdown(self.segment_length)

		text_segments = self.convert_all(list_path_segments)
		connected_text = self.connect(text_segments)


		text_file = open(output_file, 'w')
		text_file.write(connected_text)
		text_file.close()

		shutil.rmtree(self.segment_dir)


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
			cur_path = os.path.join(tmp_dir, str(start_sec) + '.wav')
			segments_path.append(cur_path)
			segment.export(cur_path, format='wav')

		return tmp_dir, segments_path

	def convert(self, segment_file):
		with sr.AudioFile(segment_file) as source:
			audio_text = self.recognizer.listen(source)
			try:
				text = self.recognizer.recognize_google(audio_text)
				print(text)
				return text
			except:
				return None

	def connect(self, segments):
		connected = ''
		_n = len(segments)
		for i in range(_n):
			connected = connected + '\n' + segments[i]

		return connected


	def convert_all(self, _list_of_path):
		_n = len(_list_of_path)
		text = []
		print('converting...')
		for i in range(_n):
			print(i)
			phrase = self.convert(_list_of_path[i])
			if phrase is not None:
				text.append(phrase)

		return text

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


	def isVideo(self, filename):
		if filename.endswith(('.avi', '.mov', '.mp4', '.ogv', '.webm')): return True
		else: return False


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


	def Video_to_Audio(self, path_to_video, format='mp3'):
			file_name = get_filename(path_to_video)
			self.format = format
			path_to_audio = file_name + '.' + format
			video = mp.VideoFileClip(path_to_video)
			video.audio.write_audiofile(path_to_audio)

			return path_to_audio


def get_filename(file_path):
	file_name = os.path.basename(file_path)
	file_name = file_name.split('.')[:-1]
	file_name = ''.join(file_name)

	return file_name


if __name__ == '__main__':
	stt = Speech_to_Text()
	stt('How we teach computers to understand pictures - Fei Fei Li.mp3', 'tmp.txt')
	# stt('SampleVideo_360x240.mp4')
	# stt('hello.wav')