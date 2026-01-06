<template>
  <view class="study-page" :class="typeClass">
    <!-- 积木风格装饰元素 -->
    <view class="decoration-block decoration-1"></view>
    <view class="decoration-block decoration-2"></view>
    <view class="decoration-block decoration-3"></view>
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text>返回</text>
      </view>
      <text class="page-title">{{ typeName }}</text>
      <view class="progress-info">
        <text class="progress-text">{{ currentIndex + 1 }}/{{ totalCount }}</text>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 核心内容区 -->
      <view class="core-content">
        <view class="main-char" @click="toggleDetails">
          <text class="char-text">{{ currentItem.name }}</text>
        </view>
        
        <!-- 拼音标注（点击后显示） -->
        <view v-if="showDetails" class="pinyin-display">
          <text class="pinyin-text">{{ currentItem.pinyin || currentItem.name }}</text>
        </view>
        
        <!-- 主要操作按钮 -->
        <view class="main-action">
          <view class="play-btn" @click="playAudio">
            <text class="play-icon">🔊</text>
            <text class="play-text">听发音</text>
          </view>
        </view>
      </view>
      
      <!-- 辅助功能区（需要时显示） -->
      <view v-if="showDetails" class="details-content">
        <!-- 示例词语（简化为一个） -->
        <view v-if="exampleWords.length > 0" class="example-word">
          <text class="word-text">{{ exampleWords[0].text }}</text>
          <text class="word-pinyin">{{ exampleWords[0].pinyin }}</text>
          <view class="word-audio" @click="playWordAudio(exampleWords[0])">🔊</view>
        </view>
        
        <!-- 简化自评 -->
        <view class="simple-assessment">
          <view class="assessment-btn" :class="{ active: assessment === 'mastered' }" @click="setAssessment('mastered')">
            <text class="assessment-text">学会了</text>
          </view>
          <view class="assessment-btn" @click="setAssessment('learning')">
            <text class="assessment-text">再学学</text>
          </view>
        </view>
      </view>
      
      <!-- 简化导航 -->
      <view v-if="showDetails" class="simple-nav">
        <view class="nav-btn" v-if="!isLastItem" @click="goNext">
          <text class="nav-text">下一个 →</text>
        </view>
      </view>
      
      <!-- 进度指示 -->
      <view class="progress-dots">
        <view 
          v-for="(dot, index) in totalCount" 
          :key="index"
          class="progress-dot"
          :class="{ active: index <= currentIndex }"
        ></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StudyPage',
  data() {
    return {
      type: '',
      name: '',
      currentIndex: 0,
      repeatCount: 1,
      assessment: '',
      showDetails: false, // 控制详细内容的显示
      shengmuData: [
        { name: 'b', examples: [
          { text: '波浪', pinyin: 'bō làng' },
          { text: '玻璃', pinyin: 'bō li' },
          { text: '拨打', pinyin: 'bō dá' }
        ], tip: '双唇紧闭，突然张开，气流冲出' },
        { name: 'p', examples: [
          { text: '爬山', pinyin: 'pá shān' },
          { text: '皮球', pinyin: 'pí qiú' },
          { text: '朋友', pinyin: 'péng you' }
        ], tip: '双唇紧闭，突然张开，送气强' },
        { name: 'm', examples: [
          { text: '妈妈', pinyin: 'mā ma' },
          { text: '木头', pinyin: 'mù tou' },
          { text: '帽子', pinyin: 'mào zi' }
        ], tip: '双唇紧闭，气流从鼻腔通过' },
        { name: 'f', examples: [
          { text: '飞机', pinyin: 'fēi jī' },
          { text: '花朵', pinyin: 'huā duǒ' },
          { text: '衣服', pinyin: 'yī fu' }
        ], tip: '上齿接触下唇，气流从缝隙中摩擦而出' },
        { name: 'd', examples: [
          { text: '大树', pinyin: 'dà shù' },
          { text: '弟弟', pinyin: 'dì di' },
          { text: '读书', pinyin: 'dú shū' }
        ], tip: '舌尖抵住上齿龈，突然放开' },
        { name: 't', examples: [
          { text: '天空', pinyin: 'tiān kōng' },
          { text: '踢球', pinyin: 'tī qiú' },
          { text: '太阳', pinyin: 'tài yáng' }
        ], tip: '舌尖抵住上齿龈，突然放开，送气强' },
        { name: 'n', examples: [
          { text: '牛奶', pinyin: 'niú nǎi' },
          { text: '鸟儿', pinyin: 'niǎo er' },
          { text: '南方', pinyin: 'nán fāng' }
        ], tip: '舌尖抵住上齿龈，气流从鼻腔通过' },
        { name: 'l', examples: [
          { text: '老师', pinyin: 'lǎo shī' },
          { text: '老虎', pinyin: 'lǎo hǔ' },
          { text: '蓝色', pinyin: 'lán sè' }
        ], tip: '舌尖抵住上齿龈，气流从舌头两侧通过' },
        { name: 'g', examples: [
          { text: '哥哥', pinyin: 'gē ge' },
          { text: '鸽子', pinyin: 'gē zi' },
          { text: '唱歌', pinyin: 'chàng gē' }
        ], tip: '舌根抵住软腭，突然放开' },
        { name: 'k', examples: [
          { text: '看书', pinyin: 'kàn shū' },
          { text: '裤子', pinyin: 'kù zi' },
          { text: '天空', pinyin: 'tiān kōng' }
        ], tip: '舌根抵住软腭，突然放开，送气强' },
        { name: 'h', examples: [
          { text: '喝水', pinyin: 'hē shuǐ' },
          { text: '河流', pinyin: 'hé liú' },
          { text: '花朵', pinyin: 'huā duǒ' }
        ], tip: '舌根接近软腭，气流从缝隙中摩擦而出' },
        { name: 'j', examples: [
          { text: '家里', pinyin: 'jiā lǐ' },
          { text: '飞机', pinyin: 'fēi jī' },
          { text: '姐姐', pinyin: 'jiě jie' }
        ], tip: '舌面前部抵住硬腭，突然放开' },
        { name: 'q', examples: [
          { text: '气球', pinyin: 'qì qiú' },
          { text: '秋天', pinyin: 'qiū tiān' },
          { text: '请假', pinyin: 'qǐng jià' }
        ], tip: '舌面前部抵住硬腭，突然放开，送气强' },
        { name: 'x', examples: [
          { text: '西瓜', pinyin: 'xī guā' },
          { text: '学校', pinyin: 'xué xiào' },
          { text: '下雨', pinyin: 'xià yǔ' }
        ], tip: '舌面前部接近硬腭，气流从缝隙中摩擦而出' },
        { name: 'zh', examples: [
          { text: '知道', pinyin: 'zhī dào' },
          { text: '桌子', pinyin: 'zhuō zi' },
          { text: '纸巾', pinyin: 'zhǐ jīn' }
        ], tip: '舌尖翘起抵住硬腭，突然放开' },
        { name: 'ch', examples: [
          { text: '吃饭', pinyin: 'chī fàn' },
          { text: '汽车', pinyin: 'qì chē' },
          { text: '出口', pinyin: 'chū kǒu' }
        ], tip: '舌尖翘起抵住硬腭，突然放开，送气强' },
        { name: 'sh', examples: [
          { text: '老师', pinyin: 'lǎo shī' },
          { text: '石头', pinyin: 'shí tou' },
          { text: '书本', pinyin: 'shū běn' }
        ], tip: '舌尖翘起接近硬腭，气流从缝隙中摩擦而出' },
        { name: 'r', examples: [
          { text: '日本', pinyin: 'rì běn' },
          { text: '日子', pinyin: 'rì zi' },
          { text: '如果', pinyin: 'rú guǒ' }
        ], tip: '舌尖翘起接近硬腭，气流从缝隙中摩擦而出，声带振动' },
        { name: 'z', examples: [
          { text: '字典', pinyin: 'zì diǎn' },
          { text: '写字', pinyin: 'xiě zì' },
          { text: '粽子', pinyin: 'zòng zi' }
        ], tip: '舌尖抵住上齿背，突然放开' },
        { name: 'c', examples: [
          { text: '草地', pinyin: 'cǎo dì' },
          { text: '吃饭', pinyin: 'chī fàn' },
          { text: '青菜', pinyin: 'qīng cài' }
        ], tip: '舌尖抵住上齿背，突然放开，送气强' },
        { name: 's', examples: [
          { text: '松树', pinyin: 'sōng shù' },
          { text: '颜色', pinyin: 'yán sè' },
          { text: '思考', pinyin: 'sī kǎo' }
        ], tip: '舌尖接近上齿背，气流从缝隙中摩擦而出' },
        { name: 'y', examples: [
          { text: '衣服', pinyin: 'yī fu' },
          { text: '月亮', pinyin: 'yuè liang' },
          { text: '鱼儿', pinyin: 'yú er' }
        ], tip: '舌面抬高接近硬腭，声带振动' },
        { name: 'w', examples: [
          { text: '娃娃', pinyin: 'wá wa' },
          { text: '乌龟', pinyin: 'wū guī' },
          { text: '袜子', pinyin: 'wà zi' }
        ], tip: '双唇收圆，声带振动' }
      ],
      yunmuData: {
        single: [
          { name: 'a', examples: [
            { text: '阿姨', pinyin: 'ā yí' },
            { text: '爸爸', pinyin: 'bà ba' },
            { text: '妈妈', pinyin: 'mā ma' }
          ], tip: '口张大，舌位低，舌面中部微微隆起' },
          { name: 'o', examples: [
            { text: '哦', pinyin: 'ō' },
            { text: '伯伯', pinyin: 'bó bo' },
            { text: '婆婆', pinyin: 'pó po' }
          ], tip: '口腔半闭，双唇收圆，舌头后缩' },
          { name: 'e', examples: [
            { text: '鹅', pinyin: 'é' },
            { text: '哥哥', pinyin: 'gē ge' },
            { text: '唱歌', pinyin: 'chàng gē' }
          ], tip: '口腔半开，嘴角向两边咧开' },
          { name: 'i', examples: [
            { text: '衣服', pinyin: 'yī fu' },
            { text: '弟弟', pinyin: 'dì di' },
            { text: '椅子', pinyin: 'yǐ zi' }
          ], tip: '口腔开度小，嘴角向两边展开，舌尖抵住下齿背' },
          { name: 'u', examples: [
            { text: '乌鸦', pinyin: 'wū yā' },
            { text: '乌龟', pinyin: 'wū guī' },
            { text: '跳舞', pinyin: 'tiào wǔ' }
          ], tip: '口腔开度小，双唇收圆，舌头后缩' },
          { name: 'ü', examples: [
            { text: '鱼', pinyin: 'yú' },
            { text: '下雨', pinyin: 'xià yǔ' },
            { text: '语文', pinyin: 'yǔ wén' }
          ], tip: '口腔开度小，双唇收圆，舌尖抵住下齿背' }
        ],
        compound: [
          { name: 'ai', examples: [
            { text: '爱', pinyin: 'ài' },
            { text: '白菜', pinyin: 'bái cài' },
            { text: '太奶', pinyin: 'tài nǎi' }
          ], tip: '由a和i组成，a重i轻，口形由大到小' },
          { name: 'ei', examples: [
            { text: '黑', pinyin: 'hēi' },
            { text: '妹妹', pinyin: 'mèi mei' },
            { text: '贝贝', pinyin: 'bèi bei' }
          ], tip: '由e和i组成，e重i轻，口形由半开到小' },
          { name: 'ui', examples: [
            { text: '水', pinyin: 'shuǐ' },
            { text: '腿', pinyin: 'tuǐ' },
            { text: '对', pinyin: 'duì' }
          ], tip: '由u和ei组成，u重ei轻，口形由圆到扁' },
          { name: 'ao', examples: [
            { text: '袄', pinyin: 'ǎo' },
            { text: '宝宝', pinyin: 'bǎo bao' },
            { text: '草帽', pinyin: 'cǎo mào' }
          ], tip: '由a和o组成，a重o轻，口形由大到圆' },
          { name: 'ou', examples: [
            { text: '欧', pinyin: 'ōu' },
            { text: '口', pinyin: 'kǒu' },
            { text: '手', pinyin: 'shǒu' }
          ], tip: '由o和u组成，o重u轻，口形由圆到更圆' },
          { name: 'iu', examples: [
            { text: '优', pinyin: 'yōu' },
            { text: '六', pinyin: 'liù' },
            { text: '牛', pinyin: 'niú' }
          ], tip: '由i和ou组成，i重ou轻，口形由扁到圆' },
          { name: 'ie', examples: [
            { text: '叶', pinyin: 'yè' },
            { text: '爷爷', pinyin: 'yé ye' },
            { text: '姐姐', pinyin: 'jiě jie' }
          ], tip: '由i和e组成，i重e轻，口形由扁到半开' },
          { name: 'üe', examples: [
            { text: '月', pinyin: 'yuè' },
            { text: '雪', pinyin: 'xuě' },
            { text: '学习', pinyin: 'xué xí' }
          ], tip: '由ü和e组成，ü重e轻，口形由圆到半开' },
          { name: 'er', examples: [
            { text: '儿', pinyin: 'ér' },
            { text: '耳朵', pinyin: 'ěr duo' },
            { text: '二', pinyin: 'èr' }
          ], tip: '特殊韵母，口形半开，舌尖卷起' }
        ],
        nasal: [
          { name: 'an', examples: [
            { text: '安', pinyin: 'ān' },
            { text: '看', pinyin: 'kàn' },
            { text: '山', pinyin: 'shān' }
          ], tip: '由a和n组成，a重n轻，口形由大到闭，鼻音收尾' },
          { name: 'en', examples: [
            { text: '恩', pinyin: 'ēn' },
            { text: '门', pinyin: 'mén' },
            { text: '盆', pinyin: 'pén' }
          ], tip: '由e和n组成，e重n轻，口形由半开到闭，鼻音收尾' },
          { name: 'in', examples: [
            { text: '因', pinyin: 'yīn' },
            { text: '心', pinyin: 'xīn' },
            { text: '金', pinyin: 'jīn' }
          ], tip: '由i和n组成，i重n轻，口形由小到闭，鼻音收尾' },
          { name: 'un', examples: [
            { text: '温', pinyin: 'wēn' },
            { text: '问', pinyin: 'wèn' },
            { text: '军', pinyin: 'jūn' }
          ], tip: '由u和n组成，u重n轻，口形由圆到闭，鼻音收尾' },
          { name: 'ün', examples: [
            { text: '晕', pinyin: 'yūn' },
            { text: '群', pinyin: 'qún' },
            { text: '云', pinyin: 'yún' }
          ], tip: '由ü和n组成，ü重n轻，口形由圆到闭，鼻音收尾' },
          { name: 'ang', examples: [
            { text: '昂', pinyin: 'áng' },
            { text: '忙', pinyin: 'máng' },
            { text: '方', pinyin: 'fāng' }
          ], tip: '由a和ng组成，a重ng轻，口形由大到闭，鼻音收尾' },
          { name: 'eng', examples: [
            { text: '灯', pinyin: 'dēng' },
            { text: '能', pinyin: 'néng' },
            { text: '风', pinyin: 'fēng' }
          ], tip: '由e和ng组成，e重ng轻，口形由半开到闭，鼻音收尾' },
          { name: 'ing', examples: [
            { text: '英', pinyin: 'yīng' },
            { text: '明', pinyin: 'míng' },
            { text: '清', pinyin: 'qīng' }
          ], tip: '由i和ng组成，i重ng轻，口形由小到闭，鼻音收尾' },
          { name: 'ong', examples: [
            { text: '东', pinyin: 'dōng' },
            { text: '红', pinyin: 'hóng' },
            { text: '中', pinyin: 'zhōng' }
          ], tip: '由o和ng组成，o重ng轻，口形由圆到闭，鼻音收尾' }
        ]
      },
      zhengtiData: [
        { name: 'zhi', pinyin: 'zhī', examples: [
          { text: '知道', pinyin: 'zhī dào' },
          { text: '报纸', pinyin: 'bào zhǐ' },
          { text: '指针', pinyin: 'zhǐ zhēn' }
        ], tip: '整体认读音节，发音同声母zh，但自成音节' },
        { name: 'chi', pinyin: 'chī', examples: [
          { text: '吃饭', pinyin: 'chī fàn' },
          { text: '尺子', pinyin: 'chǐ zi' },
          { text: '翅膀', pinyin: 'chì bǎng' }
        ], tip: '整体认读音节，发音同声母ch，但自成音节' },
        { name: 'shi', pinyin: 'shī', examples: [
          { text: '老师', pinyin: 'lǎo shī' },
          { text: '石头', pinyin: 'shí tou' },
          { text: '是', pinyin: 'shì' }
        ], tip: '整体认读音节，发音同声母sh，但自成音节' },
        { name: 'ri', pinyin: 'rī', examples: [
          { text: '日本', pinyin: 'rì běn' },
          { text: '日子', pinyin: 'rì zi' },
          { text: '太阳', pinyin: 'tài yáng' }
        ], tip: '整体认读音节，发音同声母r，但自成音节' },
        { name: 'zi', pinyin: 'zī', examples: [
          { text: '字典', pinyin: 'zì diǎn' },
          { text: '写字', pinyin: 'xiě zì' },
          { text: '紫色', pinyin: 'zǐ sè' }
        ], tip: '整体认读音节，发音同声母z，但自成音节' },
        { name: 'ci', pinyin: 'cī', examples: [
          { text: '次', pinyin: 'cì' },
          { text: '此次', pinyin: 'cǐ cì' },
          { text: '刺', pinyin: 'cì' }
        ], tip: '整体认读音节，发音同声母c，但自成音节' },
        { name: 'si', pinyin: 'sī', examples: [
          { text: '思考', pinyin: 'sī kǎo' },
          { text: '私', pinyin: 'sī' },
          { text: '死', pinyin: 'sǐ' }
        ], tip: '整体认读音节，发音同声母s，但自成音节' },
        { name: 'yi', pinyin: 'yī', examples: [
          { text: '衣服', pinyin: 'yī fu' },
          { text: '椅子', pinyin: 'yǐ zi' },
          { text: '容易', pinyin: 'róng yì' }
        ], tip: '整体认读音节，发音同韵母i，但自成音节' },
        { name: 'wu', pinyin: 'wū', examples: [
          { text: '乌鸦', pinyin: 'wū yā' },
          { text: '屋子', pinyin: 'wū zi' },
          { text: '跳舞', pinyin: 'tiào wǔ' }
        ], tip: '整体认读音节，发音同韵母u，但自成音节' },
        { name: 'yu', pinyin: 'yū', examples: [
          { text: '鱼', pinyin: 'yú' },
          { text: '下雨', pinyin: 'xià yǔ' },
          { text: '语文', pinyin: 'yǔ wén' }
        ], tip: '整体认读音节，发音同韵母ü，但自成音节' },
        { name: 'ye', pinyin: 'yē', examples: [
          { text: '爷爷', pinyin: 'yé ye' },
          { text: '叶子', pinyin: 'yè zi' },
          { text: '也许', pinyin: 'yě xǔ' }
        ], tip: '整体认读音节，发音同韵母ie，但自成音节' },
        { name: 'yue', pinyin: 'yuē', examples: [
          { text: '月亮', pinyin: 'yuè liang' },
          { text: '约', pinyin: 'yuē' },
          { text: '越', pinyin: 'yuè' }
        ], tip: '整体认读音节，发音同韵母üe，但自成音节' },
        { name: 'yuan', pinyin: 'yuān', examples: [
          { text: '圆', pinyin: 'yuán' },
          { text: '公园', pinyin: 'gōng yuán' },
          { text: '远', pinyin: 'yuǎn' }
        ], tip: '整体认读音节，发音同韵母üan，但自成音节' },
        { name: 'yin', pinyin: 'yīn', examples: [
          { text: '音乐', pinyin: 'yīn yuè' },
          { text: '银行', pinyin: 'yín háng' },
          { text: '因为', pinyin: 'yīn wèi' }
        ], tip: '整体认读音节，发音同韵母in，但自成音节' },
        { name: 'yun', pinyin: 'yūn', examples: [
          { text: '云', pinyin: 'yún' },
          { text: '运动', pinyin: 'yùn dòng' },
          { text: '允许', pinyin: 'yǔn xǔ' }
        ], tip: '整体认读音节，发音同韵母ün，但自成音节' },
        { name: 'ying', pinyin: 'yīng', examples: [
          { text: '英雄', pinyin: 'yīng xióng' },
          { text: '应该', pinyin: 'yīng gāi' },
          { text: '电影', pinyin: 'diàn yǐng' }
        ], tip: '整体认读音节，发音同韵母ing，但自成音节' }
      ],
      assessmentOptions: [
        { value: 'learning', text: '学习中', icon: '🕐' },
        { value: 'mastered', text: '已掌握', icon: '⭐' },
        { value: 'review', text: '需复习', icon: '🔄' }
      ]
    };
  },
  computed: {
    typeClass() {
      return {
        'type-shengmu': this.type === 'shengmu',
        'type-yunmu': this.type === 'yunmu',
        'type-zhengti': this.type === 'zhengti'
      };
    },
    typeName() {
      const typeMap = {
        'shengmu': '声母学习',
        'yunmu': '韵母学习',
        'zhengti': '整体认读'
      };
      return typeMap[this.type] || '';
    },
    currentData() {
      if (this.type === 'shengmu') {
        return this.shengmuData;
      } else if (this.type === 'yunmu') {
        // 合并所有韵母类别
        return [
          ...this.yunmuData.single,
          ...this.yunmuData.compound,
          ...this.yunmuData.nasal
        ];
      } else if (this.type === 'zhengti') {
        return this.zhengtiData;
      }
      return [];
    },
    currentItem() {
      return this.currentData[this.currentIndex] || {};
    },
    exampleWords() {
      return this.currentItem.examples || [];
    },
    pronunciationTip() {
      return this.currentItem.tip || '';
    },
    totalCount() {
      return this.currentData.length;
    },
    isFirstItem() {
      return this.currentIndex === 0;
    },
    isLastItem() {
      return this.currentIndex === this.totalCount - 1;
    }
  },
  onLoad(options) {
    this.type = options.type || '';
    this.name = options.name || '';
    
    // 根据名称找到对应的索引
    if (this.name) {
      const index = this.currentData.findIndex(item => item.name === this.name);
      if (index !== -1) {
        this.currentIndex = index;
      }
    }
    
    // 加载学习进度
    this.loadProgress();
    
    // 自动播放一次发音
    setTimeout(() => {
      this.playAudio();
    }, 1000);
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    playAudio() {
      // 播放当前拼音的音频
      // 这里应该调用音频播放API
      console.log(`播放 ${this.currentItem.name} 的音频`);
      
      // 如果设置了重复次数，则重复播放
      if (this.repeatCount > 1) {
        let count = 1;
        const playInterval = setInterval(() => {
          console.log(`重复播放 ${this.currentItem.name} 的音频，第${count + 1}次`);
          count++;
          if (count >= this.repeatCount) {
            clearInterval(playInterval);
          }
        }, 2000); // 每2秒播放一次
      }
    },
    playWordAudio(word) {
      // 播放示例词语的音频
      console.log(`播放词语 ${word.text} 的音频`);
    },
    setRepeatCount(count) {
      this.repeatCount = count;
    },
    setAssessment(value) {
      this.assessment = value;
      this.saveProgress();
      
      // 如果标记为学会了，自动进入下一个
      if (value === 'mastered') {
        setTimeout(() => {
          this.goNext();
        }, 1000);
      } else if (value === 'learning') {
        // 如果标记为再学学，显示详细内容
        this.showDetails = true;
      }
      
      // 显示提示
      const option = this.assessmentOptions.find(item => item.value === value);
      if (option) {
        uni.showToast({
          title: `已标记为${option.text}`,
          icon: 'success'
        });
      }
    },
    goPrev() {
      if (!this.isFirstItem) {
        this.currentIndex--;
        this.assessment = '';
        this.loadCurrentItemProgress();
      }
    },
    goNext() {
      if (!this.isLastItem) {
        this.currentIndex++;
        this.assessment = '';
        this.showDetails = false; // 重置详细内容显示状态
        this.loadCurrentItemProgress();
      }
    },
    toggleDetails() {
      this.showDetails = !this.showDetails;
    },
    loadProgress() {
      try {
        const progressKey = `${this.type}_progress`;
        const savedProgress = uni.getStorageSync(progressKey);
        
        if (savedProgress) {
          // 加载当前项的学习状态
          this.loadCurrentItemProgress();
        }
      } catch (e) {
        console.error('加载进度失败', e);
      }
    },
    loadCurrentItemProgress() {
      try {
        const progressKey = `${this.type}_progress`;
        const savedProgress = uni.getStorageSync(progressKey);
        
        if (savedProgress) {
          let progressArray = [];
          
          if (this.type === 'shengmu' || this.type === 'zhengti') {
            progressArray = savedProgress;
          } else if (this.type === 'yunmu') {
            // 合并所有韵母类别的进度
            progressArray = [
              ...savedProgress.single,
              ...savedProgress.compound,
              ...savedProgress.nasal
            ];
          }
          
          if (progressArray[this.currentIndex]) {
            this.assessment = progressArray[this.currentIndex].status || '';
          }
        }
      } catch (e) {
        console.error('加载当前项进度失败', e);
      }
    },
    saveProgress() {
      try {
        const progressKey = `${this.type}_progress`;
        let savedProgress = uni.getStorageSync(progressKey);
        
        if (!savedProgress) {
          // 如果没有保存的进度，初始化
          if (this.type === 'shengmu') {
            savedProgress = this.shengmuData.map(item => ({
              name: item.name,
              status: 'locked'
            }));
          } else if (this.type === 'yunmu') {
            savedProgress = {
              single: this.yunmuData.single.map(item => ({
                name: item.name,
                status: 'locked'
              })),
              compound: this.yunmuData.compound.map(item => ({
                name: item.name,
                status: 'locked'
              })),
              nasal: this.yunmuData.nasal.map(item => ({
                name: item.name,
                status: 'locked'
              }))
            };
          } else if (this.type === 'zhengti') {
            savedProgress = this.zhengtiData.map(item => ({
              name: item.name,
              status: 'locked'
            }));
          }
        }
        
        // 更新当前项的状态
        if (this.type === 'shengmu' || this.type === 'zhengti') {
          const itemIndex = savedProgress.findIndex(item => item.name === this.currentItem.name);
          if (itemIndex !== -1) {
            savedProgress[itemIndex].status = this.assessment;
          }
        } else if (this.type === 'yunmu') {
          // 确定当前项属于哪个类别
          let category = null;
          if (this.yunmuData.single.some(item => item.name === this.currentItem.name)) {
            category = 'single';
          } else if (this.yunmuData.compound.some(item => item.name === this.currentItem.name)) {
            category = 'compound';
          } else if (this.yunmuData.nasal.some(item => item.name === this.currentItem.name)) {
            category = 'nasal';
          }
          
          if (category) {
            const itemIndex = savedProgress[category].findIndex(item => item.name === this.currentItem.name);
            if (itemIndex !== -1) {
              savedProgress[category][itemIndex].status = this.assessment;
            }
          }
        }
        
        // 解锁下一项
        this.unlockNextItem(savedProgress);
        
        // 保存进度
        uni.setStorageSync(progressKey, savedProgress);
      } catch (e) {
        console.error('保存进度失败', e);
      }
    },
    unlockNextItem(progress) {
      // 如果当前项已标记为学习中或已掌握，则解锁下一项
      if (this.assessment === 'learning' || this.assessment === 'mastered') {
        if (this.type === 'shengmu' || this.type === 'zhengti') {
          if (this.currentIndex < this.totalCount - 1) {
            const nextItem = progress[this.currentIndex + 1];
            if (nextItem && nextItem.status === 'locked') {
              nextItem.status = 'learning';
            }
          }
        } else if (this.type === 'yunmu') {
          // 确定下一项属于哪个类别
          const nextItem = this.currentData[this.currentIndex + 1];
          if (nextItem) {
            let category = null;
            if (this.yunmuData.single.some(item => item.name === nextItem.name)) {
              category = 'single';
            } else if (this.yunmuData.compound.some(item => item.name === nextItem.name)) {
              category = 'compound';
            } else if (this.yunmuData.nasal.some(item => item.name === nextItem.name)) {
              category = 'nasal';
            }
            
            if (category) {
              const itemIndex = progress[category].findIndex(item => item.name === nextItem.name);
              if (itemIndex !== -1 && progress[category][itemIndex].status === 'locked') {
                progress[category][itemIndex].status = 'learning';
              }
            }
          }
        }
      }
    }
  }
};
</script>

<style scoped>
/* 页面基础样式 */
.study-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 不同类型的背景色 */
.type-shengmu {
  background: #FF476F;
}

.type-yunmu {
  background: #FBBF24;
}

.type-zhengti {
  background: #3B82F6;
}

/* 积木风格装饰元素 */
.decoration-block {
  position: absolute;
  border-radius: 24rpx;
  z-index: 0;
}

.decoration-1 {
  top: 20rpx;
  right: 20rpx;
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(15deg);
  animation: float-left 8s ease-in-out infinite reverse;
}

.decoration-2 {
  top: 200rpx;
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(-8deg);
  animation: float 6s ease-in-out infinite;
}

.decoration-3 {
  bottom: 100rpx;
  right: 50rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(12deg);
  animation: float-right 7s ease-in-out infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-20rpx) rotate(-12deg); }
}

@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

@keyframes float-right {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-15rpx) rotate(18deg); }
}

/* 页面头部 */
.header {
  padding: 60rpx 32rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.back-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
}

.progress-info {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
}

.progress-text {
  font-weight: bold;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 20rpx 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* 核心内容区 */
.core-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 40rpx;
  transition: all 0.3s ease;
}

/* 辅助功能区 */
.details-content {
  width: 100%;
  opacity: 0;
  transition: opacity 0.3s ease 0.2s;
  margin-bottom: 40rpx;
}

.details-content.show {
  opacity: 1;
}

/* 简化导航 */
.simple-nav {
  width: 100%;
  opacity: 0;
  transition: opacity 0.3s ease 0.2s;
  margin-top: 20rpx;
}

.simple-nav.show {
  opacity: 1;
}

/* 进度指示 */
.progress-dots {
  display: flex;
  gap: 16rpx;
  margin-top: 30rpx;
}

.progress-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: #FFFFFF;
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.2);
}

/* 学习内容展示区 */
.content-display {
  margin-bottom: 40rpx;
  text-align: center;
}

.main-char {
  background: #FFFFFF;
  border: 8rpx solid #FFFFFF;
  border-radius: 32rpx;
  width: 300rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.main-char:active {
  transform: scale(0.95);
  box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.1);
}

.char-text {
  font-size: 160rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1;
}

.pinyin-display {
  margin-top: 16rpx;
}

.pinyin-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  background: #FFFFFF;
  padding: 12rpx 32rpx;
  border-radius: 20rpx;
  color: #333333;
  border: 4rpx solid #FFFFFF;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

/* 主要操作按钮 */
.main-action {
  margin-top: 20rpx;
}

.play-btn {
  background: #FFFFFF;
  border: 8rpx solid #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
  width: 240rpx;
}

.play-btn:active {
  transform: scale(0.95);
  box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.1);
}

.play-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.play-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.repeat-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.repeat-label {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.repeat-buttons {
  display: flex;
  gap: 12rpx;
}

.repeat-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.repeat-btn.active {
  background: #FF476F;
  border: 4rpx solid #FF476F;
  box-shadow: 0 8rpx 0 #E53E5F;
}

.repeat-btn.active text {
  color: #FFFFFF;
}

.repeat-btn text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

/* 示例词语（简化为一个） */
.example-word {
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.example-word:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.word-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.word-pinyin {
  font-size: 20rpx;
  color: #666666;
}

.word-audio {
  font-size: 32rpx;
  cursor: pointer;
}

.word-audio:active {
  transform: scale(0.9);
}

/* 发音要点区 */
.pronunciation-tip {
  width: 100%;
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.tip-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF476F;
  margin-bottom: 16rpx;
  display: block;
}

.tip-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

/* 简化自评 */
.simple-assessment {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  margin-bottom: 20rpx;
}

.assessment-btn {
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120rpx;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.assessment-btn.active {
  background: #FF476F;
  border: 4rpx solid #FF476F;
  box-shadow: 0 8rpx 0 #E53E5F;
}

.assessment-btn.active .assessment-text {
  color: #FFFFFF;
}

.assessment-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

/* 简化导航 */
.simple-nav {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}

.nav-btn {
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  color: #333333;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 20rpx;
  padding: 16rpx 40rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.nav-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.nav-text {
  font-weight: bold;
}
</style>