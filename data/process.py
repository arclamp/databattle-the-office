import json
import pprint
import sys
import unicodecsv as csv


def sentiment_analysis(data):
    from nltk.classify import NaiveBayesClassifier
    from nltk.corpus import subjectivity
    from nltk.sentiment import SentimentAnalyzer
    from nltk.sentiment.util import *

    n_instances = 100
    subj_docs = [(sent, 'subj') for sent in subjectivity.sents(categories='subj')[:n_instances]]
    obj_docs = [(sent, 'obj') for sent in subjectivity.sents(categories='obj')[:n_instances]]

    train_subj_docs = subj_docs[:80]
    test_subj_docs = subj_docs[80:100]
    train_obj_docs = obj_docs[:80]
    test_obj_docs = obj_docs[80:100]
    training_docs = train_subj_docs+train_obj_docs
    testing_docs = test_subj_docs+test_obj_docs

    sentim_analyzer = SentimentAnalyzer()
    all_words_neg = sentim_analyzer.all_words([mark_negation(doc) for doc in training_docs])

    unigram_feats = sentim_analyzer.unigram_word_feats(all_words_neg, min_freq=4)
    sentim_analyzer.add_feat_extractor(extract_unigram_feats, unigrams=unigram_feats)

    training_set = sentim_analyzer.apply_features(training_docs)
    test_set = sentim_analyzer.apply_features(testing_docs)

    trainer = NaiveBayesClassifier.train
    classifier = sentim_analyzer.train(trainer, training_set)

    for key,value in sorted(sentim_analyzer.evaluate(test_set).items()):
        print('{0}: {1}'.format(key, value))

    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    from nltk import tokenize

    sid = SentimentIntensityAnalyzer()
    for line in data:
        ss = sid.polarity_scores(line['line_text'])
        line['compound'] = ss['compound']
        line['neg'] = ss['neg']
        line['pos'] = ss['pos']
        line['neu'] = ss['neu']

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

    if False:
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

    sentiment_analysis(data)
    # data = sorted(data, key=lambda x: x['pos'], reverse=True)

    sentiment = {}
    for d in filter(lambda x: x['speaker'] in ['Michael'], data):
        speaker = d['speaker']
        season = d['season']

        if speaker not in sentiment:
            sentiment[speaker] = {}
        if season not in sentiment[speaker]:
            sentiment[speaker][season] = []

        sentiment[speaker][season].append({
            'pos': d['pos']#,
            # 'line_text': d['line_text']
        })

    with open('sentiment.json', 'w') as out:
        out.write(json.dumps(sentiment, indent=2))


if __name__ == '__main__':
    sys.exit(main())
