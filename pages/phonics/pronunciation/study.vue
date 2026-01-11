<template>
  <view class="study-page" :class="typeClass">
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
        <!-- 字母展示区 -->
        <view class="letter-display">
          <view class="main-char" :animation="animationData" @click="onLetterClick">
            <text class="char-text">{{ currentItem.name }}</text>
          </view>
        </view>
        
        <!-- 阶段标题 -->
        <view class="stage-title">
          <text class="stage-text">{{ stageTitle }}</text>
        </view>
        
        <!-- 声调学习区 -->
        <view v-if="learningStage === 'tone'" class="tone-learning-area">
          <view class="current-tone-display">
            <view class="tone-char-container">
              <text class="tone-symbol">{{ currentToneData.symbol }}</text>
              <text class="tone-letter">{{ currentItem.name }}</text>
            </view>
            <text class="tone-name">{{ currentToneData.name }}</text>
          </view>
          
          <view class="tone-progress">
            <view 
              v-for="(tone, index) in tones" 
              :key="index"
              class="tone-progress-item"
              :class="{ 
                active: index === currentToneIndex,
                completed: index < currentToneIndex 
              }"
            ></view>
          </view>
          
          <view class="tone-actions">
            <view class="block-btn skip-btn" @click="skipTone">
              <text class="btn-text">跳过</text>
            </view>
            <view class="block-btn next-btn" @click="nextTone">
              <text class="btn-text">下一步</text>
            </view>
          </view>
        </view>
        
        <!-- 组词练习区 -->
        <view v-if="learningStage === 'words'" class="word-learning-area">
          <view class="current-word-display" @click="playWordAudio(currentWordData)">
            <text class="word-text">{{ currentWordData.text }}</text>
            <text class="word-pinyin">{{ currentWordData.pinyin }}</text>
          </view>
          
          <view class="word-progress">
            <view 
              v-for="(word, index) in currentItem.examples" 
              :key="index"
              class="word-progress-item"
              :class="{ 
                active: index === currentWordIndex,
                completed: index < currentWordIndex 
              }"
            ></view>
          </view>
          
          <view class="word-actions">
            <view class="block-btn skip-btn" @click="skipWord">
              <text class="btn-text">跳过</text>
            </view>
            <view class="block-btn next-btn" @click="nextWord">
              <text class="btn-text">下一步</text>
            </view>
          </view>
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
import { pinyinAudioPlayer } from '@/src/services/PinyinAudioPlayer'
import { parseWordPinyin, audioFileExists } from '@/src/services/pinyinAudio'
import { useGlobalStore } from '@/src/store/global'

export default {
  name: 'StudyPage',
  data() {
    return {
      globalStore: null,
      type: '',
      name: '',
      currentIndex: 0,
      assessment: '',
      showDetails: false, // 控制详细内容的显示
      currentTone: 1, // 当前选择的声调
      learningStage: 'initial', // 学习阶段: initial(初始), tone(声调学习), words(组词练习)
      currentToneIndex: 0, // 当前学习的声调索引
      currentWordIndex: 0, // 当前学习的词语索引
      animationData: {}, // 动画数据
      // 字母组合数据
      letterGroups: [
        { suffix: 'a', name: 'a' },
        { suffix: 'o', name: 'o' },
        { suffix: 'e', name: 'e' },
        { suffix: 'i', name: 'i' },
        { suffix: 'u', name: 'u' },
        { suffix: 'ü', name: 'ü' }
      ],
      // 四声调数据
      tones: [
        { symbol: '¯', name: '一声' },
        { symbol: '´', name: '二声' },
        { symbol: 'ˇ', name: '三声' },
        { symbol: '`', name: '四声' }
      ],
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
    },
    showGroups() {
      const result = this.showDetails;
      console.log('showGroups computed:', result, 'showDetails:', this.showDetails);
      return result;
    },
    currentToneData() {
      return this.tones[this.currentToneIndex] || {};
    },
    currentWordData() {
      const words = this.currentItem.examples || [];
      return words[this.currentWordIndex] || {};
    },
    stageTitle() {
      const stageMap = {
        'initial': '点击字母开始学习',
        'tone': `声调学习 - ${this.currentToneData.name}`,
        'words': '组词练习'
      };
      return stageMap[this.learningStage] || '';
    }
  },
  onLoad(options) {
    this.globalStore = useGlobalStore()
    this.type = options.type || '';
    this.name = options.name || '';
    
    console.log('onLoad - type:', this.type, 'name:', this.name);
    
    // 根据名称找到对应的索引
    if (this.name) {
      const index = this.currentData.findIndex(item => item.name === this.name);
      if (index !== -1) {
        this.currentIndex = index;
        console.log('onLoad - currentIndex set to:', this.currentIndex);
      }
    }
    
    // 加载学习进度
    this.loadCurrentItemProgress();
    
    // 自动播放一次发音
    setTimeout(() => {
      console.log('onLoad - calling onLetterClick');
      this.onLetterClick(); // 直接点击字母，播放音频并显示详细内容
    }, 1000);
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    playWordAudio(word) {
      const pinyin = word.pinyin || word.text || ''
      
      console.log('playWordAudio 被调用')
      console.log('词语:', word.text)
      console.log('拼音:', pinyin)
      
      const pinyinList = parseWordPinyin(pinyin)
      
      console.log('解析后的拼音列表:', pinyinList)
      
      if (pinyinList.length === 0) {
        console.warn(`无法解析拼音: ${pinyin}`)
        return
      }
      
      console.log(`播放词语 ${word.text} 的拼音序列:`, pinyinList)
      
      pinyinAudioPlayer.playSequence({
        pinyinList: pinyinList,
        interval: 0,
        onComplete: () => {
          console.log(`播放词语 ${word.text} 完成`)
        },
        onError: (error) => {
          console.error('播放失败:', error)
        }
      })
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
    // 点击字母直接播放音频并进入声调学习阶段
    onLetterClick() {
      console.log('onLetterClick 开始执行');
      
      this.showDetails = true;
      this.learningStage = 'tone';
      this.currentToneIndex = 0;
      this.currentWordIndex = 0;
      
      console.log('点击字母后 showDetails:', this.showDetails);
      console.log('learningStage:', this.learningStage);
      console.log('currentToneIndex:', this.currentToneIndex);
      console.log('currentItem:', this.currentItem);
      
      this.playAudio();
      console.log('onLetterClick 执行完成');
      
      // 播放字母音频后，自动播放第一个声调音频
      setTimeout(() => {
        this.playToneAudio(this.currentItem.name, 1);
      }, 500);
    },
    
    // 点击组词
    onGroupClick(group) {
      this.playGroupAudio(group);
    },
    
    // 点击声调
    onToneClick(tone) {
      this.currentTone = tone;
      this.playToneAudio(this.currentItem.name, tone);
    },
    
    // 下一个
    goNext() {
      if (!this.isLastItem) {
        this.saveProgress();
        
        // 自动进入下一个
        setTimeout(() => {
          this.currentIndex++;
          this.assessment = '';
          this.showDetails = false;
          this.loadCurrentItemProgress();
        }, 1000);
      }
    },
    
    // 播放字母音频
    playAudio() {
      const pinyin = this.currentItem.name
      
      // 检查音频是否存在
      const audioExists = audioFileExists(pinyin, 0)
      
      if (!audioExists) {
        console.warn(`字母音频 ${pinyin}.mp3 不存在，尝试查找带声调的音频`)
        
        // 尝试查找带声调的音频
        for (let tone = 1; tone <= 4; tone++) {
          if (audioFileExists(pinyin, tone)) {
            console.log(`找到带声调的音频 ${pinyin}${tone}.mp3`)
            this.playToneAudio(pinyin, tone)
            this.animateLetterBlock()
            return
          }
        }
        
        console.warn(`字母音频 ${pinyin} 不存在，使用默认音频 a.mp3`)
        
        // 使用默认音频
        pinyinAudioPlayer.play({
          pinyin: 'a',
          tone: 0,
          onComplete: () => {
            console.log(`播放默认音频 a.mp3 完成`)
          },
          onError: (error) => {
            console.error('默认音频播放失败:', error)
          }
        })
        
        this.animateLetterBlock()
        return
      }
      
      // 播放字母音频
      pinyinAudioPlayer.play({
        pinyin: pinyin,
        tone: 0,
        onComplete: () => {
          console.log(`播放 ${pinyin} 完成`)
        },
        onError: (error) => {
          console.error('播放失败:', error)
        }
      })
      
      // 添加视觉反馈
      this.animateLetterBlock();
    },
    
    // 播放组词音频
    playGroupAudio(group) {
      const combination = this.currentItem.name + group.suffix
      
      // 检查组合音频是否存在
      const audioExists = audioFileExists(combination, 0)
      
      if (!audioExists) {
        console.warn(`组合音频 ${combination}.mp3 不存在，尝试查找带声调的音频`)
        
        // 尝试查找带声调的音频
        for (let tone = 1; tone <= 4; tone++) {
          if (audioFileExists(combination, tone)) {
            console.log(`找到带声调的音频 ${combination}${tone}.mp3`)
            this.playToneAudio(combination, tone)
            return
          }
        }
        
        console.warn(`组合音频 ${combination} 不存在，使用默认音频 a.mp3`)
        
        // 使用默认音频
        pinyinAudioPlayer.play({
          pinyin: 'a',
          tone: 0,
          onComplete: () => {
            console.log(`播放默认音频 a.mp3 完成`)
          },
          onError: (error) => {
            console.error('默认音频播放失败:', error)
          }
        })
        return
      }
      
      // 播放组合音频
      pinyinAudioPlayer.play({
        pinyin: combination,
        tone: 0,
        onComplete: () => {
          console.log(`播放组词 ${combination} 完成`)
        },
        onError: (error) => {
          console.error('播放失败:', error)
        }
      })
    },
    
    // 播放声调音频
    playToneAudio(letter, tone) {
      const toneSymbol = this.tones[tone - 1].symbol
      const combination = letter + toneSymbol
      
      // 检查音频是否存在
      const audioExists = audioFileExists(letter, tone)
      
      if (!audioExists) {
        console.warn(`声调音频 ${letter}${tone}.mp3 不存在，尝试查找其他声调`)
        
        // 尝试查找其他声调的音频
        for (let otherTone = 1; otherTone <= 4; otherTone++) {
          if (otherTone !== tone && audioFileExists(letter, otherTone)) {
            console.log(`找到其他声调的音频 ${letter}${otherTone}.mp3`)
            pinyinAudioPlayer.play({
              pinyin: letter,
              tone: otherTone,
              onComplete: () => {
                console.log(`播放声调 ${letter}${this.tones[otherTone - 1].symbol} 完成`)
              },
              onError: (error) => {
                console.error('播放失败:', error)
              }
            })
            return
          }
        }
        
        console.warn(`声调音频 ${letter} 不存在，使用默认音频 a.mp3`)
        
        // 使用默认音频
        pinyinAudioPlayer.play({
          pinyin: 'a',
          tone: 0,
          onComplete: () => {
            console.log(`播放默认音频 a.mp3 完成`)
          },
          onError: (error) => {
            console.error('默认音频播放失败:', error)
          }
        })
        return
      }
      
      // 播放声调音频
      pinyinAudioPlayer.play({
        pinyin: letter,
        tone: tone,
        onComplete: () => {
          console.log(`播放声调 ${combination} 完成`)
        },
        onError: (error) => {
          console.error('播放失败:', error)
        }
      })
    },
    
    // 字母积木动画
    animateLetterBlock() {
      try {
        const query = uni.createSelectorQuery().in(this);
        query.select('.main-char').boundingClientRect();
        query.exec((res) => {
          if (res && res[0]) {
            const animation = uni.createAnimation({
              duration: 200,
              timingFunction: 'ease-in-out'
            });
            animation.scale(0.95).step();
            animation.scale(1).step();
            this.animationData = animation.export();
          }
        });
      } catch (e) {
        console.error('animateLetterBlock 错误:', e);
      }
    },
    loadCurrentItemProgress() {
      try {
        let savedProgress = null
        
        if (this.type === 'shengmu') {
          savedProgress = this.globalStore.shengmuProgress
        } else if (this.type === 'yunmu') {
          savedProgress = this.globalStore.yunmuProgress
        } else if (this.type === 'zhengti') {
          savedProgress = this.globalStore.zhengtiProgress
        }
        
        if (savedProgress) {
          let progressArray = [];
          
          if (this.type === 'shengmu' || this.type === 'zhengti') {
            progressArray = savedProgress;
          } else if (this.type === 'yunmu') {
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
        let savedProgress = null
        
        if (this.type === 'shengmu') {
          savedProgress = this.globalStore.shengmuProgress
        } else if (this.type === 'yunmu') {
          savedProgress = this.globalStore.yunmuProgress
        } else if (this.type === 'zhengti') {
          savedProgress = this.globalStore.zhengtiProgress
        }
        
        if (!savedProgress) {
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
        
        if (this.type === 'shengmu' || this.type === 'zhengti') {
          const itemIndex = savedProgress.findIndex(item => item.name === this.currentItem.name);
          if (itemIndex !== -1) {
            savedProgress[itemIndex].status = this.assessment;
          }
        } else if (this.type === 'yunmu') {
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
        
        this.unlockNextItem(savedProgress);
        
        if (this.type === 'shengmu') {
          this.globalStore.setShengmuProgress(savedProgress)
        } else if (this.type === 'yunmu') {
          this.globalStore.setYunmuProgress(savedProgress)
        } else if (this.type === 'zhengti') {
          this.globalStore.setZhengtiProgress(savedProgress)
        }
      } catch (e) {
        console.error('保存进度失败', e);
      }
    },
    
    // 下一个
    goNext() {
      if (!this.isLastItem) {
        this.saveProgress();
        
        // 自动进入下一个
        setTimeout(() => {
          this.currentIndex++;
          this.assessment = '';
          this.showDetails = false;
          this.loadCurrentItemProgress();
        }, 1000);
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
    },
    
    // 下一个声调
    nextTone() {
      console.log('nextTone 被调用，当前声调索引:', this.currentToneIndex);
      
      if (this.currentToneIndex < this.tones.length - 1) {
        // 还有下一个声调
        this.currentToneIndex++;
        console.log('进入下一个声调，索引:', this.currentToneIndex);
        
        // 播放当前声调音频
        this.playToneAudio(this.currentItem.name, this.currentToneIndex + 1);
      } else {
        // 所有声调学习完成，进入组词练习
        console.log('声调学习完成，进入组词练习');
        this.learningStage = 'words';
        this.currentWordIndex = 0;
        
        // 播放第一个词语音频
        this.playWordAudio(this.currentWordData);
      }
    },
    
    // 跳过声调学习
    skipTone() {
      console.log('skipTone 被调用，跳过声调学习');
      this.learningStage = 'words';
      this.currentWordIndex = 0;
    },
    
    // 下一个词语
    nextWord() {
      console.log('nextWord 被调用，当前词语索引:', this.currentWordIndex);
      
      const words = this.currentItem.examples || [];
      
      if (this.currentWordIndex < words.length - 1) {
        // 还有下一个词语
        this.currentWordIndex++;
        console.log('进入下一个词语，索引:', this.currentWordIndex);
        
        // 播放当前词语音频
        this.playWordAudio(this.currentWordData);
      } else {
        // 所有词语学习完成，进入下一个字母
        console.log('组词练习完成，进入下一个字母');
        this.goNextLetter();
      }
    },
    
    // 跳过组词练习
    skipWord() {
      console.log('skipWord 被调用，跳过组词练习');
      this.goNextLetter();
    },
    
    // 进入下一个字母
    goNextLetter() {
      console.log('goNextLetter 被调用，当前索引:', this.currentIndex);
      
      if (!this.isLastItem) {
        // 保存当前字母的进度
        this.assessment = 'mastered';
        this.saveProgress();
        
        // 延迟后进入下一个字母
        setTimeout(() => {
          this.currentIndex++;
          this.assessment = '';
          this.showDetails = false;
          this.learningStage = 'initial';
          this.currentToneIndex = 0;
          this.currentWordIndex = 0;
          this.loadCurrentItemProgress();
          console.log('已进入下一个字母，新索引:', this.currentIndex);
        }, 500);
      } else {
        // 所有字母学习完成
        console.log('所有字母学习完成');
        uni.showToast({
          title: '恭喜完成所有学习！',
          icon: 'success'
        });
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
  overflow-y: auto;
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
.type-shengmu::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #D97706;
}

.type-shengmu::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.type-yunmu::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.type-yunmu::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.type-zhengti::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #D97706;
}

.type-zhengti::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #E53E5F;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-20rpx) rotate(-15deg); }
}

/* 左上角装饰元素浮动动画 */
@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
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
  justify-content: flex-start;
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

/* 字母展示区 */
.letter-display {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
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
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
}

.main-char:hover {
  transform: translateY(-8rpx);
  box-shadow: 0 16rpx 0 rgba(0, 0, 0, 0.15);
}

.main-char:active {
  transform: translateY(4rpx) scale(0.95);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.main-char.playing {
  border-color: #FFD700;
  box-shadow: 0 0 0 8rpx rgba(255, 215, 0, 0.3);
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

/* 组词练习区 */
.groups-display {
  width: 100%;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 20rpx;
  text-align: center;
}

.groups-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.letter-group {
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.letter-group:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.group-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.group-audio {
  font-size: 32rpx;
  cursor: pointer;
}

.group-audio:active {
  transform: scale(0.9);
}

/* 声调学习区 */
.tones-display {
  width: 100%;
  margin-bottom: 40rpx;
}

.tones-container {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.tone-item {
  background: #FFFFFF;
  border: 4rpx solid #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.tone-item.active {
  background: #FF476F;
  border: 4rpx solid #FF476F;
  box-shadow: 0 8rpx 0 #E53E5F;
}

.tone-item.active .tone-symbol,
.tone-item.active .tone-name {
  color: #FFFFFF;
}

.tone-symbol {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.tone-name {
  font-size: 24rpx;
  color: #333333;
}

/* 阶段标题 */
.stage-title {
  width: 100%;
  margin-bottom: 40rpx;
}

.stage-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-align: center;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

/* 声调学习区 */
.tone-learning-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  animation: slide-up 0.4s ease;
}

.current-tone-display {
  background: #FFFFFF;
  border: 8rpx solid #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
  animation: pop-in 0.3s ease;
}

.tone-char {
  font-size: 120rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1;
}

.tone-char-container {
  position: relative;
  display: inline-block;
  height: 140rpx;
  width: 120rpx;
}

.tone-symbol {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 60rpx;
  font-weight: bold;
  color: #FF6B6B;
  line-height: 1;
  z-index: 1;
}

.tone-letter {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 120rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1;
}

.tone-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #666666;
}

.tone-progress {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.tone-progress-item {
  width: 40rpx;
  height: 40rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.tone-progress-item.active {
  background: #FFFFFF;
  box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.tone-progress-item.completed {
  background: #4CAF50;
  box-shadow: 0 6rpx 0 #388E3C;
}

.tone-actions {
  display: flex;
  gap: 24rpx;
  width: 100%;
  justify-content: center;
}

/* 组词练习区 */
.word-learning-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  animation: slide-up 0.4s ease;
}

.current-word-display {
  background: #FFFFFF;
  border: 8rpx solid #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
  animation: pop-in 0.3s ease;
}

.word-text {
  font-size: 80rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1;
}

.word-pinyin {
  font-size: 36rpx;
  font-weight: 600;
  color: #666666;
}

.word-progress {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.word-progress-item {
  width: 40rpx;
  height: 40rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.word-progress-item.active {
  background: #FFFFFF;
  box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.word-progress-item.completed {
  background: #4CAF50;
  box-shadow: 0 6rpx 0 #388E3C;
}

.word-actions {
  display: flex;
  gap: 24rpx;
  width: 100%;
  justify-content: center;
}

/* 积木风格按钮 */
.block-btn {
  background: #FFFFFF;
  border: 6rpx solid #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
  min-width: 160rpx;
}

.block-btn:active {
  transform: translateY(4rpx) scale(0.95);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.skip-btn {
  background: rgba(255, 255, 255, 0.8);
}

.next-btn {
  background: #4CAF50;
  border-color: #4CAF50;
}

.next-btn .btn-text {
  color: #FFFFFF;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

/* 动画效果 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>