'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'zh' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({} as I18nContextType);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && ['zh', 'en'].includes(saved)) setLocaleState(saved);
  }, []);
  
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };
  
  const t = (key: string): string => {
    const dict = locale === 'zh' ? zh : en;
    return dict[key as keyof typeof dict] || key;
  };
  
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Translation dictionaries
const zh: Record<string, string> = {
  // Navigation
  'nav.home': '首页',
  'nav.ai_predictions': 'AI 预测',
  'nav.predict': '手动预测',
  'nav.my_predictions': '我的预测',
  'nav.standings': '积分榜',
  'nav.bracket': '对阵图',
  'nav.leaderboard': '排行榜',
  'nav.matches': '赛程',
  'nav.self_evolution': '自进化',
  'nav.login': '登录',
  'nav.signup': '注册',
  
  // Home
  'home.title': 'FIFA 世界杯 2026',
  'home.subtitle': '用 AI 智能预测每一场精彩对决',
  'home.countdown': '开幕倒计时',
  'home.days': '天',
  'home.hours': '时',
  'home.minutes': '分',
  'home.seconds': '秒',
  'home.make_prediction': '开始预测',
  'home.view_ai': '查看 AI 预测',
  'home.teams': '支国家队',
  'home.groups': '个小组',
  'home.matches_count': '场比赛',
  'home.host_countries': '个主办国',
  'home.champion_probs': 'AI 夺冠概率 Top 5',
  'home.today_matches': '今日比赛',
  'home.no_matches': '今日暂无比赛，世界杯将于 6 月 11 日开幕',
  'home.early_prediction': '提前预测',
  
  // AI Predictions
  'ai.title': 'AI 智能预测',
  'ai.subtitle': '基于 Elo 评分、历史数据和机器学习模型的比赛预测分析',
  'ai.match_predictions': '比赛预测',
  'ai.upset_alerts': '爆冷预警',
  'ai.champion_probs': '夺冠概率',
  'ai.qualification': '出线概率',
  'ai.all_groups': '全部',
  'ai.all_rounds': '全部轮次',
  'ai.high_confidence': '高置信',
  'ai.medium_confidence': '中置信',
  'ai.low_confidence': '低置信',
  'ai.very_high': '极高',
  'ai.draw': '平',
  'ai.no_upsets': '暂无爆冷预警',
  'ai.upset_desc': '当 AI 预测弱队有较高胜率时触发预警',
  'ai.vs': 'vs',
  'ai.no_match_data': '暂无匹配的预测数据',
  'ai.champion_top10': '夺冠概率 Top 10',
  'ai.group_advancement': '小组出线概率',
  'ai.may_defeat': '可能击败',
  'ai.predicted_score': 'AI 预测比分',
  
  // Predictions
  'predict.title': '手动预测',
  'predict.subtitle': '预测比赛结果，与 AI 一较高下',
  'predict.ai_suggestion': 'AI 建议',
  'predict.your_prediction': '你的预测',
  'predict.home_score': '主队进球',
  'predict.away_score': '客队进球',
  'predict.confidence': '信心指数',
  'predict.submit': '提交预测',
  'predict.submitted': '预测已提交！',
  'predict.no_matches': '暂无可预测的比赛',
  
  // My Predictions
  'my.title': '我的预测',
  'my.subtitle': '查看你的预测历史和准确率统计',
  'my.all': '全部',
  'my.correct': '正确',
  'my.wrong': '错误',
  'my.pending': '待定',
  'my.total': '总预测',
  'my.accuracy': '准确率',
  'my.correct_count': '正确数',
  'my.points': '总积分',
  'my.no_predictions': '暂无预测记录',
  
  // Standings
  'standings.title': '小组积分榜',
  'standings.subtitle': '2026 世界杯小组赛实时积分榜',
  'standings.played': '场',
  'standings.won': '胜',
  'standings.drawn': '平',
  'standings.lost': '负',
  'standings.gf': '进',
  'standings.ga': '失',
  'standings.gd': '净',
  'standings.pts': '分',
  'standings.no_data': '比赛开始后将显示积分榜',
  
  // Bracket
  'bracket.title': '淘汰赛对阵图',
  'bracket.subtitle': '2026 世界杯淘汰赛阶段对阵图',
  'bracket.round_of_32': '32 强',
  'bracket.round_of_16': '16 强',
  'bracket.quarter_finals': '8 强',
  'bracket.semi_finals': '半决赛',
  'bracket.third_place': '季军赛',
  'bracket.final': '决赛',
  'bracket.tbd': '待定',
  
  // Leaderboard
  'leaderboard.title': '排行榜',
  'leaderboard.subtitle': '全球用户预测积分排行',
  'leaderboard.points_rank': '积分排行',
  'leaderboard.accuracy_rank': '准确率排行',
  'leaderboard.rank': '排名',
  'leaderboard.user': '用户',
  'leaderboard.total_points': '总积分',
  'leaderboard.accuracy': '准确率',
  'leaderboard.predictions': '预测数',
  'leaderboard.no_data': '暂无排行数据',
  
  // Matches
  'matches.title': '赛程',
  'matches.subtitle': '2026 世界杯完整赛程',
  'matches.group_stage': '小组赛',
  'matches.round_of_32': '32 强',
  'matches.round_of_16': '16 强',
  'matches.quarter_finals': '8 强',
  'matches.semi_finals': '半决赛',
  'matches.third_place': '季军赛',
  'matches.final': '决赛',
  'matches.vs': 'vs',
  'matches.scheduled': '未开始',
  'matches.live': '进行中',
  'matches.finished': '已结束',
  
  // Self Evolution
  'evolution.title': '自进化中心',
  'evolution.subtitle': 'AI 预测模型的自我优化过程',
  'evolution.direction_accuracy': '胜负准确率',
  'evolution.score_accuracy': '比分准确率',
  'evolution.total_reviews': '已复盘',
  'evolution.trend': '趋势',
  'evolution.weights': '模型权重演变',
  'evolution.error_dist': '误差分布',
  'evolution.accuracy_trend': '准确率趋势',
  'evolution.recent_reviews': '最近复盘',
  'evolution.agent_actions': 'Agent 操作日志',
  
  // Common
  'common.loading': '加载中...',
  'common.error': '出错了',
  'common.no_data': '暂无数据',
  'common.view_all': '查看全部',
  'common.vs': 'vs',
  'common.group': '小组',
  'common.round': '轮次',
  'common.all_matches': '全部赛程',
  
  // Footer
  'footer.description': 'AI 驱动的 2026 世界杯预测平台。参与预测、与全球用户竞争、追踪每一场比赛。',
  'footer.tournament': '赛事',
  'footer.predictions': '预测',
  'footer.account': '账户',
  'footer.copyright': '© 2026 WC2026 Predictor. 非 FIFA 官方产品。AI 驱动。',
};

const en: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.ai_predictions': 'AI Predictions',
  'nav.predict': 'Predict',
  'nav.my_predictions': 'My Predictions',
  'nav.standings': 'Standings',
  'nav.bracket': 'Bracket',
  'nav.leaderboard': 'Leaderboard',
  'nav.matches': 'Matches',
  'nav.self_evolution': 'Evolution',
  'nav.login': 'Log In',
  'nav.signup': 'Sign Up',
  
  // Home
  'home.title': 'FIFA World Cup 2026',
  'home.subtitle': 'Predict Every Match with AI Intelligence',
  'home.countdown': 'KICKOFF COUNTDOWN',
  'home.days': 'DAYS',
  'home.hours': 'HOURS',
  'home.minutes': 'MINUTES',
  'home.seconds': 'SECONDS',
  'home.make_prediction': 'Make Your Prediction',
  'home.view_ai': 'View AI Predictions',
  'home.teams': 'Teams',
  'home.groups': 'Groups',
  'home.matches_count': 'Matches',
  'home.host_countries': 'Host Countries',
  'home.champion_probs': 'AI Champion Probabilities Top 5',
  'home.today_matches': "Today's Matches",
  'home.no_matches': 'No matches scheduled today. The tournament kicks off on June 11, 2026.',
  'home.early_prediction': 'Make Early Predictions',
  
  // AI Predictions
  'ai.title': 'AI Predictions',
  'ai.subtitle': 'Match prediction analysis based on Elo ratings, historical data, and ML models',
  'ai.match_predictions': 'Match Predictions',
  'ai.upset_alerts': 'Upset Alerts',
  'ai.champion_probs': 'Champion Probabilities',
  'ai.qualification': 'Qualification',
  'ai.all_groups': 'All',
  'ai.all_rounds': 'All Rounds',
  'ai.high_confidence': 'High',
  'ai.medium_confidence': 'Medium',
  'ai.low_confidence': 'Low',
  'ai.very_high': 'Very High',
  'ai.draw': 'Draw',
  'ai.no_upsets': 'No upset alerts at this time',
  'ai.upset_desc': 'Triggered when AI predicts underdog has high win probability',
  'ai.vs': 'vs',
  'ai.no_match_data': 'No matching prediction data',
  'ai.champion_top10': 'Champion Probability Top 10',
  'ai.group_advancement': 'Group Advancement Probability',
  'ai.may_defeat': 'may defeat',
  'ai.predicted_score': 'AI Predicted Score',
  
  // Predictions
  'predict.title': 'Make Predictions',
  'predict.subtitle': 'Predict match outcomes and compete with AI',
  'predict.ai_suggestion': 'AI Suggestion',
  'predict.your_prediction': 'Your Prediction',
  'predict.home_score': 'Home Goals',
  'predict.away_score': 'Away Goals',
  'predict.confidence': 'Confidence',
  'predict.submit': 'Submit Prediction',
  'predict.submitted': 'Prediction submitted!',
  'predict.no_matches': 'No matches available for prediction',
  
  // My Predictions
  'my.title': 'My Predictions',
  'my.subtitle': 'View your prediction history and accuracy stats',
  'my.all': 'All',
  'my.correct': 'Correct',
  'my.wrong': 'Wrong',
  'my.pending': 'Pending',
  'my.total': 'Total',
  'my.accuracy': 'Accuracy',
  'my.correct_count': 'Correct',
  'my.points': 'Points',
  'my.no_predictions': 'No predictions yet',
  
  // Standings
  'standings.title': 'Group Standings',
  'standings.subtitle': '2026 World Cup Group Stage Standings',
  'standings.played': 'P',
  'standings.won': 'W',
  'standings.drawn': 'D',
  'standings.lost': 'L',
  'standings.gf': 'GF',
  'standings.ga': 'GA',
  'standings.gd': 'GD',
  'standings.pts': 'Pts',
  'standings.no_data': 'Standings will appear after matches begin',
  
  // Bracket
  'bracket.title': 'Knockout Bracket',
  'bracket.subtitle': '2026 World Cup Knockout Stage Bracket',
  'bracket.round_of_32': 'Round of 32',
  'bracket.round_of_16': 'Round of 16',
  'bracket.quarter_finals': 'Quarter Finals',
  'bracket.semi_finals': 'Semi Finals',
  'bracket.third_place': 'Third Place',
  'bracket.final': 'Final',
  'bracket.tbd': 'TBD',
  
  // Leaderboard
  'leaderboard.title': 'Leaderboard',
  'leaderboard.subtitle': 'Global prediction points ranking',
  'leaderboard.points_rank': 'Points Ranking',
  'leaderboard.accuracy_rank': 'Accuracy Ranking',
  'leaderboard.rank': 'Rank',
  'leaderboard.user': 'User',
  'leaderboard.total_points': 'Points',
  'leaderboard.accuracy': 'Accuracy',
  'leaderboard.predictions': 'Predictions',
  'leaderboard.no_data': 'No leaderboard data yet',
  
  // Matches
  'matches.title': 'Matches',
  'matches.subtitle': '2026 World Cup Full Schedule',
  'matches.group_stage': 'Group Stage',
  'matches.round_of_32': 'Round of 32',
  'matches.round_of_16': 'Round of 16',
  'matches.quarter_finals': 'Quarter Finals',
  'matches.semi_finals': 'Semi Finals',
  'matches.third_place': 'Third Place',
  'matches.final': 'Final',
  'matches.vs': 'vs',
  'matches.scheduled': 'Scheduled',
  'matches.live': 'Live',
  'matches.finished': 'Finished',
  
  // Self Evolution
  'evolution.title': 'Self-Evolution Center',
  'evolution.subtitle': "AI prediction model's self-optimization process",
  'evolution.direction_accuracy': 'Direction Accuracy',
  'evolution.score_accuracy': 'Score Accuracy',
  'evolution.total_reviews': 'Reviews',
  'evolution.trend': 'Trend',
  'evolution.weights': 'Model Weights Evolution',
  'evolution.error_dist': 'Error Distribution',
  'evolution.accuracy_trend': 'Accuracy Trend',
  'evolution.recent_reviews': 'Recent Reviews',
  'evolution.agent_actions': 'Agent Actions Log',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.no_data': 'No data',
  'common.view_all': 'View All',
  'common.vs': 'vs',
  'common.group': 'Group',
  'common.round': 'Round',
  'common.all_matches': 'All Matches',
  
  // Footer
  'footer.description': 'AI-powered predictions for the FIFA World Cup 2026. Make your picks, compete with friends, and follow every match.',
  'footer.tournament': 'TOURNAMENT',
  'footer.predictions': 'PREDICTIONS',
  'footer.account': 'ACCOUNT',
  'footer.copyright': '© 2026 WC2026 Predictor. Not affiliated with FIFA. Built with AI.',
};
