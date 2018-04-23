import codecs
import io
import pprint
import sys
import unicodecsv as csv


def count_phrase(phrase, data):
    speakers = {}
    for line in data:
        if phrase in line['line_text'].lower():
            season = line['season']
            episode = line['episode']
            speaker = line['speaker']

            if season not in speakers:
                speakers[season] = {}

            if episode not in speakers[season]:
                speakers[season][episode] = {}

            speakers[season][episode][speaker] = speakers[season][episode].get(speaker, 0) + 1
    return speakers


def main():
    data = []
    with open('scripts.csv') as datafile:
        reader = csv.DictReader(datafile)
        data = list(reader)

    # Count up some phrases.
    phrases = {
        'twss': count_phrase("that's what she said", data),
        'schrute_farms': count_phrase('schrute farms', data),
        'scranton_strangler': count_phrase('scranton strangler', data),
        'here_comes_treble': count_phrase('here comes treble', data),
        'broccoli_rob': count_phrase('broccoli rob', data),
        'bsg': count_phrase('battlestar galactica', data),
        'vance_refrigeration': count_phrase('vance refrigeration', data)
    }

    for phrase in phrases:
        print '%s:' % (phrase)
        pprint.pprint(phrases[phrase])
        print


if __name__ == '__main__':
    sys.exit(main())
